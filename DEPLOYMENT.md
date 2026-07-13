# SmartCode CRM Deployment

This repository contains:

- `backend/`: Laravel API.
- `frontend/`: React/Vite SPA.
- `render.yaml`: Render blueprint for API + Postgres + static frontend.
- `.github/workflows/deploy.yml`: CI checks plus optional Render deploy hooks.

## GitHub Actions

The pipeline runs on pushes and pull requests to `main`/`master`:

1. Backend
   - installs Composer dependencies
   - prepares a SQLite test database
   - runs migrations
   - runs `vendor/bin/phpunit`

2. Frontend
   - installs npm dependencies
   - runs lint
   - builds the production Vite bundle

3. Deploy
   - triggers Render deploy hooks only when these GitHub secrets exist:
     - `RENDER_BACKEND_DEPLOY_HOOK`
     - `RENDER_FRONTEND_DEPLOY_HOOK`

Optional frontend build secrets:

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Required production environment variables

Backend/API:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...
APP_URL=https://your-api-domain
FRONTEND_URL=https://your-frontend-domain
FRONTEND_ORIGINS=https://your-frontend-domain
SANCTUM_STATEFUL_DOMAINS=your-frontend-domain
SESSION_DOMAIN=.your-root-domain

DB_CONNECTION=pgsql
DB_HOST=...
DB_PORT=5432
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
DB_SSLMODE=require

ADMIN_EMAIL=admin@smartcode.sa
ADMIN_PASSWORD=change-this-password

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URL=https://your-api-domain/api/v1/auth/google/callback

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=...
MAIL_FROM_NAME="SmartCode CRM"
NOTIFICATION_EMAIL_RECIPIENTS=admin@example.com,finance@example.com
```

Frontend/static app:

```env
VITE_API_URL=https://your-api-domain
VITE_GOOGLE_CLIENT_ID=...
```

## First deployment notes

- Do not commit `.env` files, local SQLite databases, `vendor/`, `node_modules/`, or build outputs.
- Generate `APP_KEY` on the production service, not locally inside Git.
- Configure Google OAuth redirect URI to match `GOOGLE_REDIRECT_URL`.
- Use a real SMTP provider/app password for email notifications.
- After changing production env vars, redeploy/restart the backend service.
## VPS deployment (Hostinger Ubuntu 24.04)

This repository includes a Docker Compose setup for a fresh VPS:

- PostgreSQL database
- Laravel backend API
- React frontend served by nginx
- Caddy reverse proxy for HTTPS

Current domain setup:

- Frontend: `https://influencerhub.io`
- API: `https://influencerhub.io/api/v1/...`
- Sanctum: `https://influencerhub.io/sanctum/csrf-cookie`
- Google callback: `https://influencerhub.io/api/v1/auth/google/callback`

DNS records required:

```text
A      @      187.55.244.77
CNAME  www    influencerhub.io
```

### First-time VPS preparation

SSH into the server:

```bash
ssh root@187.55.244.77
```

Install git and clone the repository:

```bash
apt update
apt install -y git
mkdir -p /opt/smartcode-crm
cd /opt/smartcode-crm
git clone <YOUR_REPO_URL> .
```

Run bootstrap:

```bash
bash deploy/vps/bootstrap-ubuntu.sh
```

Create server-only env file:

```bash
cp deploy/vps/.env.example deploy/vps/.env
nano deploy/vps/.env
```

Generate values on the VPS:

```bash
echo "base64:$(openssl rand -base64 32)"
openssl rand -base64 32
```

Use these production domain values in `deploy/vps/.env`:

```env
SITE_ADDRESS=influencerhub.io, www.influencerhub.io
APP_URL=https://influencerhub.io
FRONTEND_URL=https://influencerhub.io
FRONTEND_ORIGINS=https://influencerhub.io,https://www.influencerhub.io
SANCTUM_STATEFUL_DOMAINS=influencerhub.io,www.influencerhub.io
SESSION_DOMAIN=.influencerhub.io
VITE_API_URL=
GOOGLE_REDIRECT_URL=https://influencerhub.io/api/v1/auth/google/callback
```

Start the stack:

```bash
docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env up -d --build
```

Open:

- Frontend: `https://influencerhub.io`
- API: `https://influencerhub.io/api/v1/dashboard/stats`

### GitHub Actions VPS deploy

Set GitHub variable:

```env
ENABLE_VPS_DEPLOY=true
```

Set GitHub secrets:

```env
VPS_HOST=187.55.244.77
VPS_USER=root
VPS_PORT=22
VPS_APP_DIR=/opt/smartcode-crm
VPS_SSH_KEY=<private key that can SSH to the VPS>
VPS_REPO_URL=<repo clone url; use an SSH/deploy-key URL for private repos>
```

Important: keep `deploy/vps/.env` only on the server. Do not commit it.

After changing production env vars, redeploy:

```bash
docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env up -d --build
```