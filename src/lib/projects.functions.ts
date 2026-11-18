import { createServerFn } from "@tanstack/react-start";

export type ProjectSummary = {
  slug: string;
  title: string;
  objectType: string;
  city: string;
  year: number | null;
  summary: string;
  cover: string | null;
};
export type Project = ProjectSummary & {
  task: string;
  done: string[];
  equipment: string[];
  result: string;
  gallery: string[];
  review: { text: string; author: string } | null;
  direction: { slug: string; title: string } | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

type Row = {
  slug: string;
  title: string;
  object_type: string | null;
  city: string | null;
  year: number | null;
  summary: string | null;
  task: string | null;
  done: string | null;
  equipment: string | null;
  result: string | null;
  cover: string | null;
  review_text: string | null;
  review_author: string | null;
  seo_title: string | null;
  seo_description: string | null;
  direction: { slug: string; title: string } | null;
  gallery: { directus_files_id: string | null }[] | null;
};

const TTL_MS = Number(process.env["CMS_CACHE_SECONDS"] ?? 60) * 1000;
let cache: { at: number; rows: Row[] } | undefined;

async function load(): Promise<Row[]> {
  if (!process.env["DIRECTUS_URL"] || !process.env["DIRECTUS_TOKEN"]) return [];
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  try {
    const res = await fetch(
      `${process.env["DIRECTUS_URL"]}/items/projects?filter[status][_eq]=published&sort=sort,-year&limit=-1&fields=slug,title,object_type,city,year,summary,task,done,equipment,result,cover,review_text,review_author,seo_title,seo_description,direction.slug,direction.title,gallery.directus_files_id`,
      {
        headers: { authorization: `Bearer ${process.env["DIRECTUS_TOKEN"]}` },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) throw new Error(`CMS projects -> ${res.status}`);
    const rows = ((await res.json()) as { data: Row[] }).data;
    cache = { at: Date.now(), rows };
    return rows;
  } catch (error) {
    // Раздел не критичен: при сбое или до создания коллекции сайт работает без него
    console.error("CMS (объекты) недоступна:", error);
    return cache?.rows ?? [];
  }
}

const lines = (t: string | null) =>
  (t ?? "")
    .split(/\r?\n/)
    .map((x) => x.replace(/^[-•–\s]+/, "").trim())
    .filter(Boolean);

const summaryOf = (r: Row): ProjectSummary => ({
  slug: r.slug,
  title: r.title,
  objectType: r.object_type ?? "",
  city: r.city ?? "",
  year: r.year ?? null,
  summary: r.summary ?? "",
  cover: r.cover ? `/media/${r.cover}` : null,
});

export const getProjects = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProjectSummary[]> => (await load()).map(summaryOf),
);

export const getProject = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<Project | null> => {
    const r = (await load()).find((x) => x.slug === slug);
    if (!r) return null;
    return {
      ...summaryOf(r),
      task: r.task ?? "",
      done: lines(r.done),
      equipment: lines(r.equipment),
      result: r.result ?? "",
      gallery: (r.gallery ?? [])
        .map((g) => g.directus_files_id)
        .filter((id): id is string => !!id)
        .map((id) => `/media/${id}`),
      review: r.review_text ? { text: r.review_text, author: r.review_author ?? "" } : null,
      direction: r.direction,
      seoTitle: r.seo_title,
      seoDescription: r.seo_description,
    };
  });
