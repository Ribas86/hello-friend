import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { getProject } from "@/lib/projects.functions";
import { PageHero, Section, CtaBand } from "@/components/site/blocks";
import { clip } from "@/lib/utils";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const project = await getProject({ data: params.slug });
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData: p }) => {
    if (!p) return {};
    const title = `${p.seoTitle || p.title} — Центр Квэлити`;
    const description = clip(p.seoDescription || p.summary || p.task);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Page,
});

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border bg-card p-7 shadow-card">
      <h2 className="text-xl">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((w) => (
          <li key={w} className="flex gap-2">
            <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Page() {
  const p = Route.useLoaderData();
  const meta = [p.objectType, p.city, p.year ? String(p.year) : ""].filter(Boolean).join(", ");
  return (
    <>
      <PageHero
        {...(meta ? { eyebrow: meta } : {})}
        title={p.title}
        {...(p.summary ? { lead: p.summary } : {})}
        crumbs={[{ label: "Наши объекты", href: "/projects" }, { label: p.title }]}
      />
      <Section>
        <div className="mx-auto max-w-5xl space-y-8">
          {p.cover && (
            <img
              src={`${p.cover}?w=1400`}
              alt={p.title}
              className="w-full rounded-2xl object-cover"
            />
          )}
          {p.task && (
            <div>
              <h2 className="text-2xl">Задача</h2>
              <p className="mt-3 text-lg text-muted-foreground">{p.task}</p>
            </div>
          )}
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <List title="Что сделано" items={p.done} />
            <List title="Оборудование" items={p.equipment} />
          </div>
          {p.result && (
            <div>
              <h2 className="text-2xl">Результат</h2>
              <p className="mt-3 text-lg text-muted-foreground">{p.result}</p>
            </div>
          )}
          {p.gallery.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.gallery.map((src) => (
                <img
                  key={src}
                  src={`${src}?w=800`}
                  alt={p.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
          {p.review && (
            <blockquote className="rounded-2xl border-l-4 border-primary bg-card p-7 shadow-card">
              <p className="text-lg">«{p.review.text}»</p>
              {p.review.author && (
                <footer className="mt-3 text-sm text-muted-foreground">{p.review.author}</footer>
              )}
            </blockquote>
          )}
          <Link to="/projects" className="btn btn-outline">
            ← Все объекты
          </Link>
        </div>
      </Section>
      <CtaBand
        title="Нужна похожая система?"
        text="Рассчитайте предварительную стоимость в калькуляторе."
      />
    </>
  );
}
