import { createFileRoute } from "@tanstack/react-router";
import { advantages, company } from "@/lib/site";
import { PageHero, Section, CtaBand, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/about")({
  head: () => seo("О компании", "ООО «Центр Квелити» — 15 лет в сфере видеонаблюдения: проектирование, монтаж, модернизация и техническое обслуживание."),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHero eyebrow="О компании" title={company.name} lead={`${company.years} лет занимаемся проектированием, подбором оборудования, монтажом, настройкой, модернизацией и техническим обслуживанием систем видеонаблюдения.`} />
      <Section title="Наш подход">
        <p className="max-w-3xl text-lg text-muted-foreground">
          Для нас важна не только установка оборудования, но и работа системы после монтажа. Поэтому ключевое направление компании — постоянное техническое обслуживание. Мы работаем с объектами любого масштаба, с новыми и уже установленными системами.
        </p>
      </Section>
      <Section title="Преимущества" dark>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <div key={a.title} className="rounded-lg border border-ink-line bg-ink-raised p-6">
              <h3 className="text-lg">{a.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{a.text}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Контактное лицо">
        <div className="rounded-xl border bg-card p-7 shadow-card sm:max-w-md">
          <p className="font-display text-lg">{company.contactPerson}</p>
          <p className="text-muted-foreground">Главный инженер</p>
        </div>
      </Section>
      <CtaBand title="Обсудим ваш объект" />
    </>
  );
}
