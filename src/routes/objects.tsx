import { createFileRoute } from "@tanstack/react-router";
import { businessObjects, homeObjects } from "@/lib/site";
import { PageHero, Section, CtaBand, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/objects")({
  head: () =>
    seo(
      "Объекты и типовые решения",
      "Типовые решения видеонаблюдения для предприятий, складов, магазинов, офисов, парковок, учреждений и частных объектов.",
    ),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Объекты"
        title="Объекты и типовые решения"
        lead="Примеры задач и подходов для разных типов объектов. Конкретное решение подбирается после уточнения задачи."
      />
      <Section title="Коммерческие и общественные объекты">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businessObjects.map((o) => (
            <div key={o.title} className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="text-lg">{o.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{o.tasks}</p>
              <p className="mt-2 text-sm">{o.solution}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Частные объекты">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {homeObjects.map((o) => (
            <div key={o} className="rounded-xl border bg-card p-6 font-medium shadow-card">
              {o}
            </div>
          ))}
        </div>
      </Section>
      <CtaBand title="Подберём решение для вашего объекта" />
    </>
  );
}
