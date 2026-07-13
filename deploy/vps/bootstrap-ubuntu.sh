#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/smartcode-crm}"

echo "==> Updating packages"
apt-get update
apt-get install -y ca-certificates curl git ufw openssl

echo "==> Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
  apt-get install -y docker.io docker-compose-v2
fi

systemctl enable --now docker

mkdir -p "$APP_DIR"

echo "==> Firewall: allowing SSH, HTTP, HTTPS, API test port"
ufw allow OpenSSH || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw allow 8080/tcp || true
ufw --force enable || true

echo "==> Done. Next steps:"
echo "1) cd $APP_DIR"
echo "2) git clone <your-repo-url> ."
echo "3) cp deploy/vps/.env.example deploy/vps/.env"
echo "4) edit deploy/vps/.env and set APP_KEY/DB_PASSWORD/ADMIN_PASSWORD/etc."
echo "5) docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env up -d --build"