#!/usr/bin/env bash
#
# Creates .env from .env.example. Idempotent: an existing .env is left
# completely alone.
#
# Usage:
#   make setup
#   ./scripts/setup-env.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
  echo "==> .env already exists — leaving it untouched"
  exit 0
fi

cp .env.example .env

echo "==> Created .env"
echo ""
echo "Edit it before deploying:"
echo "  DOMAIN=            the hostname pointing at this server"
echo "  LETSENCRYPT_EMAIL= where certificate expiry warnings go"
echo "  APP_HTTP_PORT=     loopback port for this project (unique per project)"
echo ""
