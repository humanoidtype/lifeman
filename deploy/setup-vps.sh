#!/usr/bin/env bash
set -euo pipefail

# One-time VPS setup for lifeman.lxx.my.id
# Run as root: bash setup-vps.sh
# Prerequisite: DNS A record lifeman.lxx.my.id -> VPS IP (wait for propagation)

DOMAIN=lifeman.lxx.my.id
APP_DIR=/var/www/lifeman
GIT_REMOTE="${GIT_REMOTE:-}" # e.g. https://github.com/<user>/<repo>.git (or set later)

apt-get update
apt-get install -y software-properties-common curl git unzip nginx mariadb-server
add-apt-repository -y ppa:ondrej/php
apt-get update
apt-get install -y php8.5-cli php8.5-fpm php8.5-mysql php8.5-mbstring php8.5-xml \
    php8.5-curl php8.5-zip php8.5-intl php8.5-bcmath php8.5-gd

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# PHP Composer
curl -fsSL https://getcomposer.org/installer -o /tmp/composer-setup.php
php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
rm /tmp/composer-setup.php

# Database
mariadb <<SQL
CREATE DATABASE IF NOT EXISTS lifeman CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'lifeman'@'localhost' IDENTIFIED BY 'CHANGE_ME_DB_PASSWORD';
GRANT ALL PRIVILEGES ON lifeman.* TO 'lifeman'@'localhost';
FLUSH PRIVILEGES;
SQL

# Application directory
mkdir -p "$APP_DIR"
chown www-data:www-data "$APP_DIR"

if [ -n "$GIT_REMOTE" ]; then
    git clone "$GIT_REMOTE" "$APP_DIR"
    # If the repo is private, use a deploy key or PAT instead:
    #   git -C "$APP_DIR" remote set-url origin git@github.com:<user>/<repo>.git
fi

# Nginx + HTTPS
cp nginx.conf /etc/nginx/sites-available/lifeman
ln -sf /etc/nginx/sites-available/lifeman /etc/nginx/sites-enabled/lifeman
nginx -t && systemctl reload nginx

apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d "$DOMAIN" --agree-tos --redirect --non-interactive \
    --register-unsafely-without-email

echo
echo "=== Setup selesai ==="
echo "1. Isi /var/www/lifeman/.env dari .env.production.example, lalu:
     cd /var/www/lifeman && composer install --no-dev --optimize-autoloader
     php artisan key:generate && php artisan migrate --force
     php artisan config:cache && php artisan route:cache"
echo "2. Buat user admin: php artisan register"
echo "3. Untuk release berikutnya: jalankan deploy/deploy.sh di VPS."
echo "4. Verifikasi: curl -I https://$DOMAIN"