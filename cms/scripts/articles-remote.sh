#!/usr/bin/env bash
# Запускается на тестовом сервере из workflow cms-articles: копирует статьи и картинки в контейнер CMS и пишет их в базу.
set -euo pipefail
cd /opt/quality
docker compose exec -T cms rm -rf /app/content </dev/null
docker compose cp /tmp/cms-content/. cms:/app/content </dev/null
docker compose cp /tmp/cms-content/articles-publish.mjs cms:/app/scripts/articles-publish.mjs </dev/null
docker compose exec -T -e PUBLIC_URL=http://localhost:8055 cms node scripts/articles-publish.mjs "content/$CONTENT_FILE" </dev/null
sleep 65
for s in $SLUGS; do
  printf "%s: " "$s"
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost/articles/$s"
done
rm -rf /tmp/cms-content
