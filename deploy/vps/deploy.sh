#!/bin/bash

echo "🚀 Starting Deployment..."

# 1. Pull latest code (Uncomment if needed)
# git pull origin main

# 2. Build and restart containers
echo "📦 Building and starting Docker containers..."
docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env build
docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env up -d

# 3. Run Migrations
echo "🗄️ Running Migrations..."
docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env exec backend php artisan migrate --force

# 4. Run Seeders
echo "🌱 Running Seeders..."
docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env exec backend php artisan db:seed --force

# 5. Clear Caches
echo "🧹 Clearing Caches..."
docker compose -f deploy/vps/docker-compose.yml --env-file deploy/vps/.env exec backend php artisan optimize:clear

echo "✅ Deployment Completed Successfully!"
