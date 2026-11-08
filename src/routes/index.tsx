import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Home, ShieldCheck, Wrench, Check } from "lucide-react";
import hero from "@/assets/hero-camera.jpg";
import businessImg from "@/assets/business.jpg";
import homeImg from "@/assets/home.jpg";
import maintenanceImg from "@/assets/maintenance.jpg";
import {
  advantages,
  businessObjects,
  faq,
  homeObjects,
  services,
  steps,
  maintenanceWorks,
} from "@/lib/site";
import { Section, Steps, Faq, seo, ContactNotice } from "@/components/site/blocks";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "Видеонаблюдение для бизнеса и дома",
      "Проектирование, монтаж и техническое обслуживание систем видеонаблюдения любой сложности. 15 лет опыта.",
    ),
  component: Index,
});

const facts = [
  "15 лет опыта",
  "Проекты любой сложности",
  "Проектирование и монтаж",
  "Техническое обслуживание",
  "Бизнес и частные объекты",
];

function Index() {
  return (
    <>
      <section className="surface-ink relative overflow-hidden">
        <img
          src={hero}
          alt="Камеры видеонаблюдения на фасаде здания"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1088}
        />
        <div className="hero-fade absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-5 pt-24 pb-16 lg:px-8 lg:pt-36 lg:pb-24">
          <div className="max-w-3xl animate-rise">
            <p className="eyebrow mb-5">ООО «Центр Квелити»</p>
            <h1 className="text-4xl leading-[1.1] sm:text-6xl">
              Видеонаблюдение, которое работает на ваш бизнес
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              Проектируем, устанавливаем и обслуживаем системы видеонаблюдения любой сложности.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/calculator" className="btn btn-primary">
                Получить расчёт <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contacts" className="btn btn-ghost-ink">
                Заказать консультацию
              </Link>
            </div>
          </div>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-xl border border-ink-line/70 sm:grid-cols-3 lg:grid-cols-5">
            {facts.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 bg-ink/80 px-5 py-4 text-sm backdrop-blur"
              >
                <Check className="h-4 w-4 shrink-0 text-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section eyebrow="Два направления" title="Решения для организаций и частных владельцев">
        <div className="grid gap-6 lg:grid-cols-2">
          <DirectionCard
            img={businessImg}
            icon={<Building2 />}
            title="Для бизнеса"
            items={businessObjects.map((o) => o.title)}
            to="/business"
            cta="Решения для бизнеса"
          />
          <DirectionCard
            img={homeImg}
            icon={<Home />}
            title="Для дома"
            items={homeObjects}
            to="/home"
            cta="Решения для дома"
          />
        </div>
      </Section>

      <section className="surface-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Ключевое направление
            </p>
            <h2 className="text-3xl sm:text-4xl">
              Техническое обслуживание систем видеонаблюдения
            </h2>
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
          <img
            src={maintenanceImg}
            alt="Инженер обслуживает видеорегистратор в серверной стойке"
            loading="lazy"
            width={1280}
            height={896}
            className="rounded-xl shadow-glow"
          />
        </div>
      </section>

      <Section
        eyebrow="Услуги"
        title="Полный цикл работ"
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

function DirectionCard({
  img,
  icon,
  title,
  items,
  to,
  cta,
}: {
  img: string;
  icon: React.ReactNode;
  title: string;
  items: string[];
  to: "/business" | "/home";
  cta: string;
}) {
  return (
    <div className="surface-ink group relative overflow-hidden rounded-2xl">
      <img
        src={img}
        alt=""
        loading="lazy"
        width={1280}
        height={896}
        className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105"
      />
      <div className="relative flex h-full flex-col p-8 sm:p-10">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
          {icon}
        </span>
        <h3 className="mt-6 text-2xl sm:text-3xl">{title}</h3>
        <ul className="mt-5 flex-1 space-y-2">
          {items.map((i) => (
            <li key={i} className="flex gap-2 text-ink-foreground/90">
              <Check className="h-4 w-4 mt-1 shrink-0 text-primary" />
              {i}
            </li>
          ))}
        </ul>
        <Link to={to} className="btn btn-primary mt-8 self-start">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
