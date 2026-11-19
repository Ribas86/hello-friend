import { useSite } from "@/lib/use-site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero, Section, CtaBand, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/services/")({
  head: () =>
    seo(
      "Услуги",
      "Видеонаблюдение, СКУД, автоматические шлагбаумы, комплексные системы безопасности, обслуживание и дополнительные работы: проектирование, монтаж, настройка и ремонт.",
      { geo: true },
    ),
  component: Page,
});

function Page() {
  const { services, directions } = useSite();
  return (
    <>
      <PageHero
        eyebrow="Услуги"
        title="Услуги по системам безопасности"
        lead="Выполняем весь цикл работ или отдельные этапы: для новых и существующих систем."
      />
      {directions.map((d) => {
        const items = services.filter((s) => s.direction === d.slug);
        if (!items.length) return null;
        return (
          <Section key={d.slug} id={d.slug} eyebrow="Направление" title={d.title} lead={d.short}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
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
            <Link
              to="/directions/$slug"
              params={{ slug: d.slug }}
              className="mt-6 inline-block text-sm text-primary hover:underline"
            >
              О направлении →
            </Link>
          </Section>
        );
      })}
      <CtaBand title="Не знаете, какая услуга нужна?" text="Опишите задачу: подскажем решение." />
    </>
  );
}
