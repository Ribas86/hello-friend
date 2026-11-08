# Сайт ООО «Центр Квелити»

TanStack Start (React 19, TypeScript, Tailwind 4). Сборка под Node, развёртывание через Docker Compose.

## Разработка
```sh
bun install
bun run dev      # локальный сервер
bun run lint && bunx tsc --noEmit && bun run test
bun run build && bun run start   # продакшн-сборка
```

Контент (услуги, вопросы, данные компании) редактируется в админ-панели Directus (`cms/`). Без `DIRECTUS_URL` сайт использует встроенные данные из `src/lib/site.ts`.

Развёртывание, обновление и резервные копии: [docs/RUNBOOK.md](docs/RUNBOOK.md).
