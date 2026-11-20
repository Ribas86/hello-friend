import { createServerFn } from "@tanstack/react-start";
import { company as staticCompany, services as staticServices, faq as staticFaq } from "./site";
import { directions as staticDirections } from "./site";
import type { Direction, Service } from "./site";
import { baseUrl, noindex } from "./seo.server";

export type Company = {
  name: string;
  short: string;
  years: number | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  workHours: string | null;
  requisites: string | null;
};
export type Redirect = { from: string; to: string; status: 301 | 302 };
type CmsContent = {
  company: Company;
  directions: Direction[];
  services: Service[];
  faq: { q: string; a: string }[];
  redirects: Redirect[];
  source: "cms" | "static";
};
export type SiteContent = CmsContent & {
  baseUrl: string;
  noindex: boolean;
  metrikaId: string | null;
};

const staticContent = (): CmsContent => ({
  company: { ...staticCompany, workHours: null, requisites: null },
  directions: staticDirections,
  services: staticServices,
  faq: staticFaq,
  redirects: [],
  source: "static",
});

// Короткий кэш: сайт не ходит в CMS на каждый запрос, а при сбое CMS отдаёт последнюю удачную копию.
const TTL_MS = Number(process.env["CMS_CACHE_SECONDS"] ?? 60) * 1000;
let cache: { at: number; value: CmsContent } | undefined;

async function directus<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env["DIRECTUS_URL"]}${path}`, {
    headers: { authorization: `Bearer ${process.env["DIRECTUS_TOKEN"]}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`CMS ${path} -> ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

type ServiceRow = {
  slug: string;
  title: string;
  short: string | null;
  description: string | null;
  audience_text: string | null;
  steps: unknown;
  works: unknown;
  related: { related_services_id: { slug: string } | null }[] | null;
  direction: { slug: string } | null;
};
type DirectionRow = {
  slug: string;
  title: string;
  short: string | null;
  description: string | null;
  sort: number | null;
};
type RedirectRow = { from_path: string; to_path: string; status_code: number | null };
type FaqRow = { question: string; answer: string; service: { slug: string } | null };
type SettingsRow = {
  company_name: string | null;
  short_name: string | null;
  years: number | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  work_hours: string | null;
  requisites: string | null;
};

const titles = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.map((x) => (typeof x === "string" ? x : (x?.title ?? ""))).filter(Boolean)
    : [];

async function loadFromCms(): Promise<CmsContent> {
  const published = "filter[status][_eq]=published";
  const [dirRows, rows, faqRows, s, redirectRows] = await Promise.all([
    directus<DirectionRow[]>(
      `/items/directions?${published}&sort=sort&limit=-1&fields=slug,title,short,description,sort`,
    ),
    directus<ServiceRow[]>(
      `/items/services?${published}&sort=sort&limit=-1&fields=slug,title,short,description,audience_text,steps,works,direction.slug,related.related_services_id.slug`,
    ),
    directus<FaqRow[]>(
      `/items/service_faq?${published}&sort=sort&limit=-1&fields=question,answer,service.slug`,
    ),
    directus<SettingsRow>(`/items/site_settings`),
    // Редиректы не критичны: при сбое сайт работает без них
    directus<RedirectRow[]>(
      `/items/redirects?filter[is_active][_eq]=true&limit=-1&fields=from_path,to_path,status_code`,
    ).catch(() => [] as RedirectRow[]),
  ]);
  const published_slugs = new Set(rows.map((r) => r.slug));
  const services: Service[] = rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    short: r.short ?? "",
    description: r.description ?? "",
    audience: r.audience_text ?? "",
    steps: titles(r.steps),
    works: titles(r.works),
    faq: faqRows
      .filter((f) => f.service?.slug === r.slug)
      .map((f) => ({ q: f.question, a: f.answer })),
    direction: r.direction?.slug ?? "",
    related: (r.related ?? [])
      .map((x) => x.related_services_id?.slug)
      .filter((slug: string | undefined): slug is string => !!slug && published_slugs.has(slug)),
  }));
  return {
    company: {
      name: s.company_name || staticCompany.name,
      short: s.short_name || staticCompany.short,
      years: s.years ?? null,
      phone: s.phone || null,
      email: s.email || null,
      address: s.address || staticCompany.address,
      workHours: s.work_hours || null,
      requisites: s.requisites || null,
    },
    directions: dirRows.map((d, i) => ({
      slug: d.slug,
      title: d.title,
      short: d.short ?? "",
      description: d.description ?? "",
      sort: d.sort ?? i + 1,
    })),
    services,
    faq: faqRows.filter((f) => !f.service).map((f) => ({ q: f.question, a: f.answer })),
    redirects: redirectRows.map((r) => ({
      from: r.from_path,
      to: r.to_path,
      status: r.status_code === 302 ? 302 : 301,
    })),
    source: "cms",
  };
}

// После сбоя CMS не обращаемся к ней на каждом запросе: иначе при зависшей CMS каждая страница ждала бы таймаут.
const RETRY_MS = Number(process.env["CMS_RETRY_SECONDS"] ?? 30) * 1000;
let failedAt: number | undefined;

/**
 * Данные сайта. При сбое CMS отдаётся последняя удачная копия, а если её ещё нет
 * (сайт только что запущен) — встроенные данные, чтобы сайт открывался, а не падал с ошибкой 500.
 */
export async function loadContent(): Promise<CmsContent> {
  // Без адреса CMS (локальная разработка) сайт работает на встроенных данных.
  if (!process.env["DIRECTUS_URL"] || !process.env["DIRECTUS_TOKEN"]) return staticContent();
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.value;
  if (failedAt !== undefined && now - failedAt < RETRY_MS) return cache?.value ?? staticContent();
  try {
    const value = await loadFromCms();
    cache = { at: Date.now(), value };
    failedAt = undefined;
    return value;
  } catch (error) {
    console.error("CMS недоступна:", error);
    failedAt = Date.now();
    return cache?.value ?? staticContent();
  }
}

export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => ({
    ...(await loadContent()),
    baseUrl: baseUrl(),
    noindex: noindex(),
    metrikaId: /^\d+$/.test(process.env["YM_COUNTER_ID"] ?? "")
      ? process.env["YM_COUNTER_ID"]!
      : null,
  }),
);

/** Для sitemap.xml: полный набор адресов с датами. */
export async function loadForSitemap(): Promise<CmsContent> {
  return loadContent();
}
