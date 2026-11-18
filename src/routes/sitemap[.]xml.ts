import { createFileRoute } from "@tanstack/react-router";
import { loadForSitemap } from "@/lib/cms.functions";
import { getArticles } from "@/lib/articles.functions";
import { getProjects } from "@/lib/projects.functions";
import { baseUrl } from "@/lib/seo.server";
import { MAINTENANCE_DIRECTION } from "@/lib/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const base = baseUrl();
        const site = await loadForSitemap();
        const { articles } = await getArticles();
        const projects = await getProjects();
        const paths = [
          "/",
          "/business",
          "/residential",
          "/private",
          "/services",
          "/maintenance",
          "/objects",
          "/calculator",
          "/articles",
          "/about",
          "/contacts",
          ...site.directions
            .filter((d) => d.slug !== MAINTENANCE_DIRECTION)
            .map((d) => `/directions/${d.slug}`),
          ...site.services.map((s) => `/services/${s.slug}`),
          ...articles.map((a) => `/articles/${a.slug}`),
          ...(projects.length ? ["/projects", ...projects.map((p) => `/projects/${p.slug}`)] : []),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
          .map((p) => `  <url><loc>${esc(base + p)}</loc></url>`)
          .join("\n")}\n</urlset>\n`;
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
      },
    },
  },
});
