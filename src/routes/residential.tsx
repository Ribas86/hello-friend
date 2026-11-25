import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { pics } from "@/lib/images";
import { residentialObjects, steps } from "@/lib/site";
import { PageHero, Section, Steps, seo, ContactNotice } from "@/components/site/blocks";

export const Route = createFileRoute("/residential")({
  head: () =>
    seo(
      "Системы безопасности для жилых комплексов",
      "Проектирование, поставка оборудования, монтаж и обслуживание систем безопасности для управляющих компаний, ТСЖ, застройщиков и эксплуатирующих организаций.",
      { geo: true },
    ),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Для жилых комплексов"
        title="Системы безопасности для жилых комплексов и многоквартирных домов"
        lead="Проектируем, поставляем оборудование, монтируем и обслуживаем системы безопасности. Состав работ определяется после обследования объекта."
        image={pics.residential}
      >
        <Link to="/calculator" className="btn btn-primary">
          Рассчитать стоимость
        </Link>
        <a href="#contacts" className="btn btn-ghost-ink glass-btn-lg">
          Связаться с нами
        </a>
      </PageHero>

      <Section eyebrow="Для кого" title="Кому мы подходим">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {residentialObjects.map((o) => (
            <li
              key={o}
              className="flex gap-3 rounded-xl border bg-card p-6 font-medium shadow-card"
            >
              <Check className="h-5 w-5 shrink-0 text-primary" />
              {o}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Процесс" title="Как мы работаем" dark>
        <Steps items={steps} dark />
      </Section>

      <Section id="contacts" eyebrow="Контакты" title="Связаться с нами">
        <div className="max-w-3xl">
          <ContactNotice />
        </div>
      </Section>
    </>
  );
}
