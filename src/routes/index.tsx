import { useSite } from "@/lib/use-site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Landmark, Home, ShieldCheck, Wrench, Check } from "lucide-react";
import { pics } from "@/lib/images";
import { DirectionLink, Picture } from "@/components/site/media";
import {
  advantages,
  businessObjects,
  homeObjects,
  residentialObjects,
  steps,
  maintenanceWorks,
} from "@/lib/site";
import { Section, Steps, Faq, seo, ContactNotice } from "@/components/site/blocks";

export const Route = createFileRoute("/")({
  head: () => ({
    ...seo(
      "Монтаж и обслуживание систем безопасности — Центр Квелити",
      "Проектирование, поставка оборудования, монтаж и обслуживание систем безопасности: видеонаблюдение, СКУД, шлагбаумы и комплексные системы.",
    ),
  }),
  component: Index,
});

function Index() {
  const { services, faq, directions } = useSite();
  return (
    <>
      <section className="surface-ink relative overflow-hidden">
        <Picture
          pic={pics.hero}
          alt="Камеры на фасаде здания"
          priority
          className="hero-kenburns absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-fade absolute inset-0" />
        <div className="hero-scan absolute inset-x-0 top-0 hidden lg:block" />
        <div
          className="hero-glow absolute hidden h-24 w-24 lg:block"
          style={{ right: "20%", top: "22%" }}
        />
        <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-8 sm:pt-12 sm:pb-10 lg:px-8 lg:pt-14 lg:pb-12">
          <div className="max-w-3xl animate-rise">
            <p className="brand-label mb-3 text-base text-primary sm:text-xl">
              ООО «Центр Квелити»
            </p>
            <h1 className="text-[1.65rem] leading-[1.15] sm:text-4xl lg:text-[2.6rem]">
              Системы безопасности: от проекта до обслуживания
            </h1>
            <p className="mt-3 max-w-xl text-sm sm:mt-4 sm:text-base text-ink-muted">
              Проектируем, поставляем оборудование, монтируем и обслуживаем системы безопасности для
              бизнеса, жилых комплексов и частных клиентов.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              <Link to="/calculator" className="btn btn-primary">
                Получить расчёт <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contacts" className="btn btn-ghost-ink">
                Заказать консультацию
              </Link>
            </div>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-3 lg:grid-cols-3">
            {directions.map((d) => (
              <li key={d.slug}>
                <DirectionLink
                  slug={d.slug}
                  className="group flex h-full items-center justify-between gap-3 rounded-lg border border-ink-line bg-ink/80 px-3 py-3 text-xs font-medium sm:px-5 sm:py-4 sm:text-sm backdrop-blur transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {d.title}
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1 group-hover:text-primary-foreground" />
                </DirectionLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section eyebrow="Клиенты" title="Решения для разных категорий клиентов" dark>
        <div className="grid gap-5 lg:grid-cols-3">
          <SegmentCard
            icon={<Building2 className="h-6 w-6" />}
            title="Для бизнеса"
            items={businessObjects.slice(0, 6).map((o) => o.title)}
            to="/business"
          />
          <SegmentCard
            icon={<Landmark className="h-6 w-6" />}
            title="Для жилых комплексов"
            items={residentialObjects}
            to="/residential"
          />
          <SegmentCard
            icon={<Home className="h-6 w-6" />}
            title="Для частных клиентов"
            items={homeObjects}
            to="/private"
          />
        </div>
      </Section>

      <section className="surface-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Ключевое направление
            </p>
            <h2 className="text-3xl sm:text-4xl">Техническое обслуживание и сервис</h2>
            <p className="mt-5 text-lg text-ink-muted">
              Система должна работать не только в день сдачи. Мы берём на регулярное обслуживание
              как установленные нами, так и существующие системы.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {maintenanceWorks.slice(0, 8).map((w) => (
                <li key={w} className="flex gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                  {w}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/maintenance" className="btn btn-primary">
                Подробнее об обслуживании
              </Link>
              <Link to="/maintenance" hash="form" className="btn btn-ghost-ink">
                Обсудить договор
              </Link>
            </div>
          </div>
          <Picture
            pic={pics.maintenance}
            alt="Инженер обслуживает оборудование в серверной стойке"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="rounded-xl shadow-glow"
          />
        </div>
      </section>

      <Section
        eyebrow="Услуги"
        title="Популярные услуги"
        lead="От обследования объекта до поддержки системы после монтажа."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 8).map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group rounded-xl border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary"
            >
              <h3 className="font-sans text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-primary transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
        <Link to="/services" className="btn btn-outline mt-8">
          Все услуги
        </Link>
      </Section>

      <Section eyebrow="Почему мы" title="Преимущества работы с нами" dark>
        <div className="grid gap-px overflow-hidden rounded-xl border border-ink-line sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <div key={a.title} className="bg-ink-raised p-7">
              <h3 className="text-lg">{a.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{a.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Как мы работаем" title="Этапы работы">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Сотрудничество" title="Варианты сотрудничества">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            [
              "Разовый заказ",
              "Проектирование, монтаж, диагностика или ремонт — отдельной работой.",
            ],
            ["Под ключ", "Обследование, проект, поставка, монтаж, настройка и сдача системы."],
            [
              "Договор обслуживания",
              "Регулярный контроль и поддержка системы по согласованному составу работ.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border bg-card p-7 shadow-card">
              <h3 className="text-lg">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Вопросы" title="Популярные вопросы">
        <Faq items={faq} />
      </Section>

      <Section id="contacts" eyebrow="Контакты" title="Связаться с нами">
        <div className="max-w-3xl">
          <ContactNotice />
        </div>
      </Section>
    </>
  );
}

function SegmentCard({
  icon,
  title,
  items,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  to: "/business" | "/private" | "/residential";
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-ink-line bg-ink-raised p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        {icon}
      </span>
      <h3 className="mt-6 text-2xl lg:min-h-[4.5rem]">{title}</h3>
      <ul className="mt-6 flex-1 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex gap-3 text-ink-foreground/90">
            <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
            {i}
          </li>
        ))}
      </ul>
      <Link to={to} className="btn btn-primary mt-8 self-start">
        Подробнее <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
