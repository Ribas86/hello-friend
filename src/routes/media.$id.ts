import { createFileRoute } from "@tanstack/react-router";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Файлы из CMS отдаём через сайт: у посетителя нет доступа к CMS, а токен читателя остаётся на сервере.
export const Route = createFileRoute("/media/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        if (!UUID.test(params.id) || !process.env["DIRECTUS_URL"]) {
          return new Response("Not found", { status: 404 });
        }
        const w = Number(new URL(request.url).searchParams.get("w"));
        const query = w > 0 && w <= 2000 ? `?width=${Math.round(w)}&fit=inside&format=webp` : "";
        const res = await fetch(`${process.env["DIRECTUS_URL"]}/assets/${params.id}${query}`, {
          headers: { authorization: `Bearer ${process.env["DIRECTUS_TOKEN"]}` },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok || !res.body) return new Response("Not found", { status: 404 });
        return new Response(res.body, {
          headers: {
            "content-type": res.headers.get("content-type") ?? "application/octet-stream",
            "cache-control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
