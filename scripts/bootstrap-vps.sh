#!/usr/bin/env bash
#
# Full zero-to-deployed setup on a brand-new Ubuntu/Debian VPS: installs
# Docker, creates .env, builds and starts the site, then configures this
# server's nginx + an SSL certificate for it — all in one run.
#
# This site runs fine alongside OTHER projects on the same VPS, each on its own
# (sub)domain: only this project's container is installed here, and the
# SSL/reverse-proxy step (make ssl) reuses the host's single nginx + certbot
# rather than trying to own port 443 itself — see scripts/deploy-host-nginx.sh.
# If nginx/certbot are already installed for another project, this leaves them
# and every other project's config alone.
#
# Usage (from the project root, after git clone):
#   ./scripts/bootstrap-vps.sh
#
# Supply the domain and email up front so nothing is prompted:
#   DOMAIN=abolfazlkeshavarz.com LETSENCRYPT_EMAIL=you@example.com ./scripts/bootstrap-vps.sh
#
# If this is not the first project on this VPS, also set a free local port
# (must be unique per project — default 8093):
#   APP_HTTP_PORT=8094 DOMAIN=... LETSENCRYPT_EMAIL=... ./scripts/bootstrap-vps.sh
#
# The script re-execs itself with sudo; you don't need to put "sudo" in front.
set -euo pipefail

cd "$(dirname "$0")/.."

# shellcheck disable=SC1091
source scripts/lib.sh

# ------------------------------------------------------------- elevate to root
if [[ "$(id -u)" != "0" ]]; then
  echo "==> Root access is required to install Docker; re-running with sudo"
  exec sudo -E bash "$0" "$@"
fi

REAL_USER="${SUDO_USER:-root}"

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This script is written only for Ubuntu/Debian (apt)." >&2
  exit 1
fi

# --------------------------------------------------------------- base packages
echo "==> Installing base packages"
apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg make git

# --------------------------------------------------------------- Docker Engine
if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker Engine"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  # shellcheck disable=SC1091
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  echo "    Docker installed."
else
  echo "==> Docker is already installed"
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: the Docker Compose v2 plugin is missing." >&2
  echo "       Install it with: apt-get install -y docker-compose-plugin" >&2
  exit 1
fi

if [[ "$REAL_USER" != "root" ]] && ! id -nG "$REAL_USER" | grep -qw docker; then
  echo "==> Adding user $REAL_USER to the docker group"
  usermod -aG docker "$REAL_USER"
  echo "    Note: you must log out/in again to run docker without sudo."
fi

# --------------------------------------------------------- domain and email
if [[ -z "${DOMAIN:-}" ]]; then
  read -r -p "Domain whose A record points to this server's IP: " DOMAIN
fi
if [[ -z "${LETSENCRYPT_EMAIL:-}" ]]; then
  read -r -p "Email for Let's Encrypt expiry warnings: " LETSENCRYPT_EMAIL
fi
: "${DOMAIN:?DOMAIN is required}"
: "${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL is required}"

if [[ -z "${APP_HTTP_PORT:-}" ]]; then
  # Pick the first free loopback port rather than making the operator guess:
  # the container only needs a private port for host nginx to proxy to.
  APP_HTTP_PORT="$(find_free_port 8093)"
  if [[ -d /etc/nginx || -x /usr/sbin/nginx ]]; then
    echo ""
    echo "nginx is already on this server (another project is likely deployed"
    echo "here). This site will publish its local port on 127.0.0.1:${APP_HTTP_PORT}"
    echo "(auto-picked as free). Press Enter to accept, or type another number:"
    read -r -p "Local port for this site [${APP_HTTP_PORT}]: " reply
    APP_HTTP_PORT="${reply:-$APP_HTTP_PORT}"
  fi
fi

# ------------------------------------------------------------------- .env
echo "==> Creating .env file"
make setup
sed -i "s|^DOMAIN=.*|DOMAIN=${DOMAIN}|" .env
sed -i "s|^LETSENCRYPT_EMAIL=.*|LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL}|" .env
sed -i "s|^APP_HTTP_PORT=.*|APP_HTTP_PORT=${APP_HTTP_PORT}|" .env
if [[ -n "${LETSENCRYPT_STAGING:-}" ]]; then
  sed -i "s|^LETSENCRYPT_STAGING=.*|LETSENCRYPT_STAGING=${LETSENCRYPT_STAGING}|" .env
fi

if [[ "$REAL_USER" != "root" ]]; then
  chown "$REAL_USER":"$REAL_USER" .env
fi

# --------------------------------------------------------------- deploy
#
# If the image is already here — loaded from a tarball built elsewhere
# (scripts/load-images.sh) — don't rebuild it. Building the frontend on a
# small VPS is the slow path, and on a filtered connection npm may not even
# reach the registry.
if docker image inspect abolfazl-portfolio:latest >/dev/null 2>&1; then
  echo "==> Prebuilt image found; skipping the build"
  make up-prebuilt
else
  echo "==> Building the image and bringing the site up"
  make deploy
fi

echo "==> Obtaining SSL certificate from Let's Encrypt"
make ssl

echo ""
echo "Site is up at https://${DOMAIN}"
