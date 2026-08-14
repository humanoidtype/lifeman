#!/usr/bin/env bash
set -euo pipefail

# Release deploy for lifeman (run on VPS, inside /var/www/lifeman)
# Usage: bash deploy/deploy.sh
# Keeps the repo in sync with origin and rebuilds production assets.

APP_DIR=/var/www/lifeman
BRANCH="${1:-master}"

if [ ! -d "$APP_DIR/.git" ]; then
    echo "ERROR: $APP_DIR bukan clone git. Jalankan setup-vps.sh dulu."
    exit 1
fi

cd "$APP_DIR"

# 1. Backend
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
composer install --no-dev --optimize-autoloader --no-interaction

# Clear stale caches so wayfinder:generate (run by vite build) sees fresh routes
php artisan optimize:clear

# 2. Frontend
npm ci
npm run build

# 3. Runtime
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 4. Reload
systemctl reload php8.5-fpm

echo "=== Deploy selesai: $(git log -1 --oneline) ==="