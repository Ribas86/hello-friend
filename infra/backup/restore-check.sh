#!/usr/bin/env bash
# Раз в квартал: восстановить копию во временную базу и убедиться, что в ней есть таблицы.
set -euo pipefail
cd "$(dirname "$0")/../.."; set -a; . ./.env; set +a
"$(dirname "$0")/restore.sh" restore_check
n=$(docker compose exec -T postgres psql -U "$POSTGRES_USER" -d restore_check -Atc "select count(*) from information_schema.tables where table_schema='public'")
echo "Таблиц в восстановленной базе: $n"
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE restore_check"
[ "$n" -gt 0 ]
