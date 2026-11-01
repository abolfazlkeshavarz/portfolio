#!/usr/bin/env bash
#
# Sets (or changes) the login for the /aboli control panel in .env, then
# restarts the container so it takes effect. Changing the password signs out
# every existing session.
#
# Usage:
#   make admin
#   ./scripts/set-admin.sh
#
# Non-interactive (e.g. from bootstrap-vps.sh):
#   ADMIN_USER=aboli ADMIN_PASSWORD='my-long-passphrase' ./scripts/set-admin.sh --no-restart
#
# Leave the password blank at the prompt to have a strong one generated and
# shown once. Allowed characters: letters, digits and . _ @ % + = : , -
set -euo pipefail

cd "$(dirname "$0")/.."

RESTART=1
[[ "${1:-}" == "--no-restart" ]] && RESTART=0

[[ -f .env ]] || ./scripts/setup-env.sh

current_user="$(grep -E '^ADMIN_USER=' .env | head -n1 | cut -d= -f2- || true)"
user="${ADMIN_USER:-}"
if [[ -z "$user" ]]; then
  read -r -p "Control panel username [${current_user:-aboli}]: " user
  user="${user:-${current_user:-aboli}}"
fi

password="${ADMIN_PASSWORD:-}"
generated=0
if [[ -z "$password" ]]; then
  read -r -s -p "Control panel password (min 10 chars, blank = generate one): " password
  echo ""
fi
if [[ -z "$password" ]]; then
  password="$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20)"
  generated=1
fi

if [[ ${#password} -lt 10 ]]; then
  echo "Error: the password must be at least 10 characters." >&2
  exit 1
fi
if ! [[ "$user" =~ ^[A-Za-z0-9._@-]+$ && "$password" =~ ^[A-Za-z0-9._@%+=:,-]+$ ]]; then
  echo "Error: use only letters, digits and . _ @ % + = : , - (no spaces, quotes or \$)." >&2
  exit 1
fi

# Rewrite the two lines without sed so no character in the password can be
# misread as part of a replacement pattern.
tmp="$(mktemp)"
grep -vE '^(ADMIN_USER|ADMIN_PASSWORD)=' .env > "$tmp" || true
{ cat "$tmp"; echo "ADMIN_USER=${user}"; echo "ADMIN_PASSWORD=${password}"; } > .env
rm -f "$tmp"
chmod 600 .env

echo "==> Control panel login saved to .env (mode 600)"
if [[ "$generated" == "1" ]]; then
  echo ""
  echo "    username: ${user}"
  echo "    password: ${password}"
  echo ""
  echo "    Save this now — it is not shown again (it stays in .env on the server)."
fi

if [[ "$RESTART" == "1" ]] && docker compose ps --status running 2>/dev/null | grep -q web; then
  echo "==> Restarting the site to apply it"
  docker compose up -d --no-build
fi
echo "    Panel: https://\${DOMAIN}/aboli"
