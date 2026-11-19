import { createFileRoute, Link } from "@tanstack/react-router";
import { getArticles } from "@/lib/articles.functions";
import { PageHero, Section, CtaBand, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/articles/")({
  validateSearch: (s: Record<string, unknown>): { topic?: string } =>
    typeof s["topic"] === "string" ? { topic: s["topic"] } : {},
  loader: () => getArticles(),
  head: () =>
    seo(
      "Статьи",
      "Экспертные статьи о выборе, монтаже и обслуживании систем безопасности для бизнеса и дома.",
    ),
  component: Page,
});

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : "";

function Page() {
  const { articles, topics } = Route.useLoaderData();
  const { topic } = Route.useSearch();
  const shown = topic ? articles.filter((a) => a.topic?.slug === topic) : articles;
  return (
    <>
      <PageHero
        eyebrow="Статьи"
        title="Статьи"
        lead="Экспертные материалы для бизнеса и частных владельцев."
      />
      <Section>
        {articles.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <p className="font-display text-xl">Раздел готовится</p>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Первые статьи появятся здесь в ближайшее время.
            </p>
          </div>
        ) : (
          <>
            {topics.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-2">
                <Link
                  to="/articles"
                  className={`rounded-md border px-4 py-2 text-sm ${!topic ? "border-primary bg-primary text-primary-foreground" : "tap-card bg-card"}`}
                >
                  Все
                </Link>
                {topics.map((t) => (
                  <Link
                    key={t.slug}
                    to="/articles"
                    search={{ topic: t.slug }}
                    className={`rounded-md border px-4 py-2 text-sm ${topic === t.slug ? "border-primary bg-primary text-primary-foreground" : "tap-card bg-card"}`}
                  >
                    {t.title}
                  </Link>
                ))}
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((a) => (
                <Link
                  key={a.slug}
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="tap-card group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card"
                >
                  {a.cover && (
                    <img
                      src={`${a.cover}?w=800`}
                      alt=""
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs text-muted-foreground">
                      {[a.topic?.title, fmt(a.publishedAt)].filter(Boolean).join(" · ")}
                    </p>
                    <h2 className="mt-2 font-sans text-lg font-semibold leading-snug">{a.title}</h2>
                    {a.summary && (
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.summary}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </Section>
      <CtaBand
        title="Есть вопрос по системам безопасности?"
        text="Рассчитайте предварительную стоимость в калькуляторе."
      />
    </>
  );
}
