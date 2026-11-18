import { createServerFn } from "@tanstack/react-start";
import sanitizeHtml from "sanitize-html";

export type ArticleSummary = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  topic: { slug: string; title: string } | null;
  cover: string | null;
};
export type Article = ArticleSummary & {
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
};
export type ArticleList = { articles: ArticleSummary[]; topics: { slug: string; title: string }[] };

type Row = {
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  published_at: string | null;
  cover: string | null;
  seo_title: string | null;
  seo_description: string | null;
  topic: { slug: string; title: string } | null;
};

const TTL_MS = Number(process.env["CMS_CACHE_SECONDS"] ?? 60) * 1000;
let cache: { at: number; rows: Row[]; topics: { slug: string; title: string }[] } | undefined;

async function directus<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env["DIRECTUS_URL"]}${path}`, {
    headers: { authorization: `Bearer ${process.env["DIRECTUS_TOKEN"]}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`CMS ${path} -> ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

async function load() {
  if (!process.env["DIRECTUS_URL"] || !process.env["DIRECTUS_TOKEN"])
    return { rows: [], topics: [] };
  if (cache && Date.now() - cache.at < TTL_MS) return cache;
  try {
    const [rows, topics] = await Promise.all([
      directus<Row[]>(
        `/items/articles?filter[status][_eq]=published&sort=-published_at&limit=-1&fields=slug,title,summary,body,published_at,cover,seo_title,seo_description,topic.slug,topic.title`,
      ),
      directus<{ slug: string; title: string }[]>(
        `/items/article_topics?sort=sort&limit=-1&fields=slug,title`,
      ),
    ]);
    cache = { at: Date.now(), rows, topics };
    return cache;
  } catch (error) {
    console.error("CMS (статьи) недоступна:", error);
    return cache ?? { rows: [], topics: [] };
  }
}

// Текст из визуального редактора: пропускаем только безопасную разметку.
const clean = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "a",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "img",
      "hr",
      "code",
      "pre",
    ],
    allowedAttributes: { a: ["href", "title"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tag, attribs) => ({
        tagName: tag,
        attribs: /^https?:/.test(attribs["href"] ?? "")
          ? { ...attribs, rel: "noopener noreferrer", target: "_blank" }
          : attribs,
      }),
    },
  });

const summaryOf = (r: Row): ArticleSummary => ({
  slug: r.slug,
  title: r.title,
  summary: r.summary ?? "",
  publishedAt: r.published_at,
  topic: r.topic,
  cover: r.cover ? `/media/${r.cover}` : null,
});

export const getArticles = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArticleList> => {
    const { rows, topics } = await load();
    return { articles: rows.map(summaryOf), topics };
  },
);

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<Article | null> => {
    const { rows } = await load();
    const r = rows.find((x) => x.slug === slug);
    if (!r) return null;
    return {
      ...summaryOf(r),
      body: clean(r.body ?? ""),
      seoTitle: r.seo_title,
      seoDescription: r.seo_description,
    };
  });
