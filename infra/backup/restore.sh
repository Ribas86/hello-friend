#!/usr/bin/env bash
# Восстановление последней копии БД в базу $1 (по умолчанию restore_check).
set -euo pipefail
cd "$(dirname "$0")/../.."; set -a; . ./.env; set +a
T="${1:-restore_check}"
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS $T" -c "CREATE DATABASE $T"
restic dump latest "db-$POSTGRES_DB.dump" | docker compose exec -T postgres pg_restore -U "$POSTGRES_USER" -d "$T" --no-owner
echo "Восстановлено в базу $T"
