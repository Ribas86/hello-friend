import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { MAINTENANCE_DIRECTION } from "@/lib/site";
import { DirectionLink } from "@/components/site/media";
import { ArrowRight } from "lucide-react";
import { getSiteContent } from "@/lib/cms.functions";
import { getArticles } from "@/lib/articles.functions";
import { PageHero, Section, CtaBand, seo, UsefulArticles } from "@/components/site/blocks";

export const Route = createFileRoute("/directions/$slug")({
  beforeLoad: ({ params }) => {
    if (params.slug === MAINTENANCE_DIRECTION)
      throw redirect({ to: "/maintenance", statusCode: 301 });
  },
  loader: async ({ params }) => {
    const [{ directions, services }, { articles, topics }] = await Promise.all([
      getSiteContent(),
      getArticles(),
    ]);
    const direction = directions.find((x) => x.slug === params.slug);
    if (!direction) throw notFound();
    return {
      topic: topics.find((t) => t.slug === direction.slug) ?? null,
      articles: articles.filter((a) => a.topic?.slug === direction.slug).slice(0, 3),
      direction,
      services: services.filter((s) => s.direction === direction.slug),
      others: directions.filter((d) => d.slug !== direction.slug),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo(
          loaderData.direction.title,
          `${loaderData.direction.short} ${loaderData.direction.description}`,
          { geo: true },
        )
      : { meta: [{ title: "Направление не найдено" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const { direction, services, others, topic, articles } = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="Направление"
        title={direction.title}
        lead={direction.description}
        crumbs={[{ label: "Услуги", href: "/services" }, { label: direction.title }]}
      />
      <Section eyebrow="Услуги" title="Что входит в направление">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="tap-card group rounded-xl border bg-card p-6 shadow-card"
            >
              <h3 className="font-sans text-lg font-semibold tracking-normal">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-primary transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </Section>
      {topic && <UsefulArticles items={articles} topic={topic} />}
      <Section eyebrow="Ещё" title="Другие направления">
        <div className="flex flex-wrap gap-3">
          {others.map((d) => (
            <DirectionLink
              key={d.slug}
              slug={d.slug}
              className="tap-card rounded-lg border bg-card px-4 py-3 text-sm font-medium shadow-card"
            >
              {d.title}
            </DirectionLink>
          ))}
        </div>
      </Section>
      <CtaBand
        title="Нужна консультация по направлению?"
        text="Опишите задачу: подскажем решение."
      />
    </>
  );
}
