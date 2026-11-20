import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getArticle } from "@/lib/articles.functions";
import { clip } from "@/lib/utils";
import { PageHero, Section, CtaBand } from "@/components/site/blocks";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const article = await getArticle({ data: params.slug });
    if (!article) throw notFound();
    return article;
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
