import { useSite } from "@/lib/use-site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero, Section, CtaBand, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/services/")({
  head: () =>
    seo(
      "Услуги",
      "Все услуги по видеонаблюдению: проектирование, монтаж, настройка, модернизация, диагностика, ремонт и техническое обслуживание.",
    ),
  component: Page,
});

function Page() {
  const { services } = useSite();
  return (
    <>
      <PageHero
        eyebrow="Услуги"
        title="Услуги по видеонаблюдению"
        lead="Выполняем весь цикл работ или отдельные этапы — для новых и существующих систем."
      />
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group rounded-xl border bg-card p-6 shadow-card transition hover:border-primary"
            >
              <span className="font-display text-xs text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-2 font-sans text-lg font-semibold tracking-normal">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-primary transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </Section>
      <CtaBand title="Не знаете, какая услуга нужна?" text="Опишите задачу — подскажем решение." />
    </>
  );
}
