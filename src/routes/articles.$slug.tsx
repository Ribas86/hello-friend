import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getArticle } from "@/lib/articles.functions";
import { getSiteContent } from "@/lib/cms.functions";
import { DirectionLink } from "@/components/site/media";
import { ArrowRight } from "lucide-react";
import { clip } from "@/lib/utils";
import { PageHero, Section, CtaBand } from "@/components/site/blocks";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const [article, site] = await Promise.all([
      getArticle({ data: params.slug }),
      getSiteContent(),
    ]);
    if (!article) throw notFound();
    const slug = article.topic?.slug;
    const direction = site.directions.find((d) => d.slug === slug) ?? null;
    const services = direction ? site.services.filter((s) => s.direction === slug).slice(0, 3) : [];
    return { ...article, direction, services };
  },
  head: ({ loaderData: a }) => {
    if (!a) return {};
    const title = `${a.seoTitle || a.title} — Центр Квэлити`;
    const description = clip(a.seoDescription || a.summary);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: Page,
});

function Page() {
  const a = Route.useLoaderData();
  const date = a.publishedAt
    ? new Date(a.publishedAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  return (
    <>
      <PageHero
        eyebrow={[a.topic?.title, date].filter(Boolean).join(" · ") || "Статья"}
        title={a.title}
        crumbs={[{ label: "Статьи", href: "/articles" }, { label: a.title }]}
        {...(a.summary ? { lead: a.summary } : {})}
      />
      <Section>
        <article className="mx-auto max-w-3xl">
          {a.cover && (
            <img
              src={`${a.cover}?w=1400`}
              alt={a.title}
              className="mb-8 aspect-[16/9] w-full rounded-2xl object-cover"
            />
          )}
          <div className="article-body" dangerouslySetInnerHTML={{ __html: a.body }} />
          {a.direction && (
            <aside className="mt-12 rounded-2xl border bg-card p-6 shadow-card sm:p-8">
              <p className="text-sm font-semibold text-primary">Услуги по теме</p>
              <DirectionLink
                slug={a.direction.slug}
                className="mt-2 block font-sans text-xl font-semibold hover:text-primary"
              >
                {a.direction.title}
                <ArrowRight className="ml-1.5 inline h-5 w-5 align-[-0.15em]" />
              </DirectionLink>
              {a.services.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                  {a.services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        to="/services/$slug"
                        params={{ slug: s.slug }}
                        className="tap-card block h-full rounded-lg border bg-background px-4 py-3 text-sm font-medium hover:border-primary"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          )}
          <Link to="/articles" className="btn btn-outline mt-10">
            ← Все статьи
          </Link>
        </article>
      </Section>
      <CtaBand
        title="Нужна консультация по вашему объекту?"
        text="Рассчитайте предварительную стоимость в калькуляторе."
      />
    </>
  );
}
