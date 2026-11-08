#!/usr/bin/env bash
# Ежедневная зашифрованная копия БД. Запуск из корня проекта, переменные из .env.
set -euo pipefail
cd "$(dirname "$0")/../.."; set -a; . ./.env; set +a
restic cat config >/dev/null 2>&1 || restic init
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" \
  | restic backup --stdin --stdin-filename "db-$POSTGRES_DB.dump" --tag db
restic forget --prune --keep-daily 7 --keep-weekly 4 --keep-monthly 3
