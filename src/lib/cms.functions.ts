import { createServerFn } from "@tanstack/react-start";
import { company as staticCompany, services as staticServices, faq as staticFaq } from "./site";
import type { Service } from "./site";

export type Company = {
  name: string;
  short: string;
  years: number;
  phone: string | null;
  email: string | null;
  address: string | null;
  workHours: string | null;
  requisites: string | null;
};
export type SiteContent = {
  company: Company;
  services: Service[];
  faq: { q: string; a: string }[];
  source: "cms" | "static";
};

const staticContent = (): SiteContent => ({
  company: { ...staticCompany, workHours: null, requisites: null },
  services: staticServices,
  faq: staticFaq,
  source: "static",
});

// Короткий кэш: сайт не ходит в CMS на каждый запрос, а при сбое CMS отдаёт последнюю удачную копию.
const TTL_MS = Number(process.env["CMS_CACHE_SECONDS"] ?? 60) * 1000;
let cache: { at: number; value: SiteContent } | undefined;

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
};
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

async function loadFromCms(): Promise<SiteContent> {
  const published = "filter[status][_eq]=published";
  const [rows, faqRows, s] = await Promise.all([
    directus<ServiceRow[]>(
      `/items/services?${published}&sort=sort&limit=-1&fields=slug,title,short,description,audience_text,steps,works,related.related_services_id.slug`,
    ),
    directus<FaqRow[]>(
      `/items/service_faq?${published}&sort=sort&limit=-1&fields=question,answer,service.slug`,
    ),
    directus<SettingsRow>(`/items/site_settings`),
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
    related: (r.related ?? [])
      .map((x) => x.related_services_id?.slug)
      .filter((slug: string | undefined): slug is string => !!slug && published_slugs.has(slug)),
  }));
  return {
    company: {
      name: s.company_name || staticCompany.name,
      short: s.short_name || staticCompany.short,
      years: s.years ?? staticCompany.years,
      phone: s.phone || null,
      email: s.email || null,
      address: s.address || null,
      workHours: s.work_hours || null,
      requisites: s.requisites || null,
    },
    services,
    faq: faqRows.filter((f) => !f.service).map((f) => ({ q: f.question, a: f.answer })),
    source: "cms",
  };
}

export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    // Без адреса CMS (локальная разработка) сайт работает на встроенных данных.
    if (!process.env["DIRECTUS_URL"] || !process.env["DIRECTUS_TOKEN"]) return staticContent();
    if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
    try {
      const value = await loadFromCms();
      cache = { at: Date.now(), value };
      return value;
    } catch (error) {
      console.error("CMS недоступна:", error);
      if (cache) return cache.value;
      throw error;
    }
  },
);
