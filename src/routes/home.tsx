import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import img from "@/assets/home.jpg";
import { homeObjects } from "@/lib/site";
import { PageHero, Section, Steps, seo, ContactNotice } from "@/components/site/blocks";

export const Route = createFileRoute("/home")({
  head: () =>
    seo(
      "Видеонаблюдение для дома",
      "Камеры для квартиры, частного дома, дачи и гаража с просмотром со смартфона. Подбор, установка и обслуживание.",
    ),
  component: Page,
});

const tasks = [
  "Наблюдение за входом и подъездом к дому",
  "Контроль двора и территории",
  "Наблюдение за гаражом",
  "Просмотр камер со смартфона",
  "Запись и хранение видео",
  "Камеры для помещений и улицы",
  "Обновление уже установленной системы",
];

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Для дома"
        title="Видеонаблюдение для дома, дачи и гаража"
        lead="Поможем выбрать камеры, установим и настроим просмотр со смартфона. Без лишних сложностей."
        image={img}
      >
        <Link to="/calculator" className="btn btn-primary">
          Рассчитать стоимость
        </Link>
        <a href="#contacts" className="btn btn-ghost-ink">
          Связаться с нами
        </a>
      </PageHero>

      <Section eyebrow="Для каких объектов" title="Подходит для">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {homeObjects.map((o) => (
            <div key={o} className="rounded-xl border bg-card p-6 font-medium shadow-card">
              {o}
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Задачи" title="Что можно решить" dark>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((t) => (
            <li key={t} className="flex gap-3 rounded-lg border border-ink-line bg-ink-raised p-5">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Как это работает" title="Простой путь">
        <Steps
          items={[
            "Выбираете задачу",
            "Подбираем оборудование",
            "Предварительный расчёт",
            "Установка и настройка",
            "Обслуживание при необходимости",
          ]}
        />
      </Section>

      <Section id="contacts" eyebrow="Контакты" title="Связаться с нами">
        <div className="max-w-3xl">
          <ContactNotice />
        </div>
      </Section>
    </>
  );
}
