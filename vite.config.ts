import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Собственная конфигурация сборки. Раньше её скрывал пакет
// @lovable.dev/vite-tanstack-config, который по умолчанию собирал под Cloudflare.
// Теперь сайт собирается как обычный Node-сервер: `bun run build`, затем
// `node .output/server/index.mjs` (см. Dockerfile и docs/RUNBOOK.md).
export default defineConfig(({ command }) => ({
  css: { transformer: "lightningcss" },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Серверная точка входа src/server.ts оборачивает ошибки отрисовки в страницу 500.
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    viteReact(),
    ...(command === "build" ? [nitro({ preset: "node-server" })] : []),
  ],
}));
