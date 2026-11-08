#!/usr/bin/env bash
# Применяет текущие файлы проекта на сервере. Запускается пользователем deploy
# из GitHub Actions (или вручную): bash infra/server/deploy.sh [--init]
#   --init  первичная загрузка: роли и права, данные из seed. Выполняется автоматически при первом запуске
#           (пока нет файла .initialized); принудительно повторять не нужно: seed перезапишет услуги.
set -euo pipefail
cd "$(dirname "$0")/../.."
[ -f .env ] || { echo "Нет .env — сначала infra/server/setup.sh"; exit 1; }
INIT=0
[ "${1:-}" = "--init" ] && INIT=1
# Первый запуск на новом сервере выполняет первичную загрузку сам (признак: файл .initialized)
[ -f .initialized ] || INIT=1

docker compose up -d --build --remove-orphans

wait_for() { # имя, команда
  for _ in $(seq 1 60); do
    if eval "$2" >/dev/null 2>&1; then echo "OK: $1"; return 0; fi
    sleep 3
  done
  echo "НЕ ЗАПУСТИЛСЯ: $1"; docker compose logs --tail=60 "$3"; exit 1
}
wait_for "cms" "docker compose exec -T cms node -e \"fetch('http://localhost:8055/server/ping').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\"" cms
wait_for "site" "docker compose exec -T site node -e \"fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\"" site

run_cms() { docker compose exec -T -e PUBLIC_URL=http://localhost:8055 cms node "scripts/$1"; }
run_cms apply-schema.mjs
if [ "$INIT" -eq 1 ]; then
  run_cms apply-access.mjs
  run_cms seed.mjs
  touch .initialized
fi
docker image prune -f >/dev/null
echo "Развёртывание завершено: $(date -Is)"
docker compose ps
