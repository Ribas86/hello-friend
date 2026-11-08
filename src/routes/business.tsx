import { createFileRoute, Link } from "@tanstack/react-router";
import img from "@/assets/business.jpg";
import { businessObjects, services, steps } from "@/lib/site";
import { PageHero, Section, Steps, seo } from "@/components/site/blocks";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/business")({
  head: () =>
    seo(
      "Видеонаблюдение для бизнеса",
      "Системы видеонаблюдения для предприятий, складов, магазинов, офисов и учреждений: проектирование, монтаж, обслуживание.",
    ),
  component: Page,
});

const businessServices = [
  "obsledovanie",
  "proektirovanie",
  "podbor-oborudovaniya",
  "postavka-oborudovaniya",
  "kabelnye-trassy",
  "ustanovka-kamer",
  "servery-arhiv",
  "udalennyj-dostup",
  "integraciya",
  "puskonaladka",
  "modernizaciya",
  "tehobsluzhivanie",
];

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Для бизнеса"
        title="Видеонаблюдение для предприятий и организаций"
        lead="Комплексный подход: от обследования объекта до регулярного обслуживания. Надёжная, управляемая система с контролем состояния оборудования — в том числе на нескольких объектах."
        image={img}
      >
        <a href="#form" className="btn btn-primary">
          Запросить коммерческое предложение
        </a>
        <a href="#form" className="btn btn-ghost-ink">
          Заказать обследование
        </a>
      </PageHero>

      <Section eyebrow="Объекты" title="Задачи и решения по типам объектов">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businessObjects.map((o) => (
            <div key={o.title} className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="text-lg">{o.title}</h3>
              <p className="mt-3 text-sm">
                <span className="font-semibold">Задачи: </span>
                <span className="text-muted-foreground">{o.tasks}</span>
              </p>
              <p className="mt-2 text-sm">
                <span className="font-semibold">Решение: </span>
                <span className="text-muted-foreground">{o.solution}</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Услуги" title="Что мы делаем для бизнеса" dark>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {businessServices.map((slug) => {
            const s = services.find((x) => x.slug === slug)!;
            return (
              <Link
                key={slug}
                to="/services/$slug"
                params={{ slug }}
                className="rounded-lg border border-ink-line bg-ink-raised p-5 transition hover:border-primary"
              >
                <p className="font-medium">{s.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{s.short}</p>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="Процесс" title="Комплексный подход">
        <Steps items={steps} />
      </Section>

      <Section
        id="form"
        eyebrow="Заявка"
        title="Коммерческое предложение, обследование или расчёт"
        lead="Укажите параметры объекта — это поможет подготовить предложение быстрее. Можно также обсудить проектирование или договор обслуживания."
      >
        <div className="max-w-3xl">
          <LeadForm variant="business" submitLabel="Отправить запрос" />
        </div>
      </Section>
    </>
  );
}
