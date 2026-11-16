import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getSiteContent } from "@/lib/cms.functions";
import { PageHero, Section, CtaBand, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/directions/$slug")({
  loader: async ({ params }) => {
    const { directions, services } = await getSiteContent();
    const direction = directions.find((x) => x.slug === params.slug);
    if (!direction) throw notFound();
    return { direction, services: services.filter((s) => s.direction === direction.slug) };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo(loaderData.direction.title, loaderData.direction.short.slice(0, 160))
      : { meta: [{ title: "Направление не найдено" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const { direction, services } = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow="Направление" title={direction.title} lead={direction.description} />
      <Section eyebrow="Услуги" title="Что входит в направление">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group rounded-xl border bg-card p-6 shadow-card transition hover:border-primary"
            >
              <h3 className="font-sans text-lg font-semibold tracking-normal">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-primary transition group-hover:translate-x-1" />
            </Link>
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
