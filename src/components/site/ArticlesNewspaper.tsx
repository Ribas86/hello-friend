import { Link } from "@tanstack/react-router";
import type { ArticleSummary } from "@/lib/articles.functions";
import { clip } from "@/lib/utils";
import { Section } from "./blocks";

const monthYear = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("ru-RU", { month: "long", year: "numeric" }) : "";
const dayMonth = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) : "";

function AllLink() {
  return (
    <Link to="/articles" className="btn btn-outline mt-8">
      Все статьи
    </Link>
  );
}

/** Свежие статьи на главной в виде газетной передовицы «Вестник безопасности». */
export function ArticlesNewspaper({ items }: { items: ArticleSummary[] }) {
  const [lead, ...rest] = items;
  if (!lead) return null;
  return (
    <Section eyebrow="Статьи" title="Свежие статьи">
      <div className="rounded-2xl border bg-card p-5 shadow-card sm:p-8 lg:p-10">
        {/* Шапка газеты */}
        <div className="border-y-4 border-double border-foreground/80 py-3 text-center">
          <p className="text-3xl font-bold tracking-tight sm:text-5xl">Вестник безопасности</p>
        </div>
        <div className="flex justify-between border-b border-foreground/30 py-2 text-xs text-muted-foreground sm:text-sm">
          <span>Центр «Квэлити»</span>
          <span className="first-letter:uppercase">{monthYear(lead.publishedAt)}</span>
          <span className="hidden sm:inline">Москва и Московская область</span>
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-0">
          {/* Передовица */}
          <Link
            to="/articles/$slug"
            params={{ slug: lead.slug }}
            className="group block lg:border-r lg:border-foreground/20 lg:pr-8"
          >
            <p className="text-sm font-semibold text-primary">{lead.topic?.title}</p>
            <h3 className="mt-2 text-3xl font-bold leading-[1.08] tracking-tight group-hover:text-primary sm:text-4xl">
              {lead.title}
            </h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {lead.cover && (
                <img
                  src={`${lead.cover}?w=900`}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover grayscale-[.15]"
                />
              )}
              <div>
                <p className="text-[15px] leading-relaxed first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-bold first-letter:leading-[.9] first-letter:text-primary">
                  {lead.summary}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">
                  Читать статью →
                </span>
              </div>
            </div>
          </Link>
          {/* Колонка */}
          <div className="divide-y divide-foreground/20 border-t border-foreground/20 lg:border-t-0 lg:pl-8">
            {rest.map((a) => (
              <Link
                key={a.slug}
                to="/articles/$slug"
                params={{ slug: a.slug }}
                className="group block py-5 first:pt-5 lg:first:pt-0"
              >
                <p className="text-xs text-muted-foreground">
                  {[a.topic?.title, dayMonth(a.publishedAt)].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1.5 text-xl font-bold leading-snug group-hover:text-primary">
                  {a.title}
                </p>
                {a.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {clip(a.summary, 120)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <AllLink />
    </Section>
  );
}
