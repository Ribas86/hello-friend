# Сайт ООО «Центр Квелити»

TanStack Start (React 19, TypeScript, Tailwind 4). Сборка под Node, развёртывание через Docker Compose.

## Разработка
```sh
bun install
bun run dev      # локальный сервер
bun run lint && bunx tsc --noEmit && bun run test
bun run build && bun run start   # продакшн-сборка
```

Развёртывание, обновление и резервные копии: [docs/RUNBOOK.md](docs/RUNBOOK.md).
