FROM php:8.3-cli

RUN apt-get update && apt-get install -y git unzip libpq-dev libzip-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . /app

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

ENV PORT=8080
ENV RUN_DEMO_SEEDERS=false
EXPOSE 8080

CMD php artisan config:clear \
    && php artisan migrate --force \
    && if [ "$RUN_DEMO_SEEDERS" = "true" ]; then php artisan db:seed --class="Database\\Seeders\\DatabaseSeeder" --force; fi \
    && php artisan serve --host=0.0.0.0 --port=${PORT}