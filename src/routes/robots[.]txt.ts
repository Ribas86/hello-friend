import { createFileRoute } from "@tanstack/react-router";
import { baseUrl, noindex } from "@/lib/seo.server";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const body = noindex()
          ? "User-agent: *\nDisallow: /\n"
          : `User-agent: *\nAllow: /\nDisallow: /media/\n\nSitemap: ${baseUrl()}/sitemap.xml\n`;
        return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
