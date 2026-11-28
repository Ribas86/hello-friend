import { useSite } from "@/lib/use-site";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { segmentArt } from "@/components/site/segment-art";
import { getProjects } from "@/lib/projects.functions";
import { getArticles } from "@/lib/articles.functions";
import { ArticlesNewspaper } from "@/components/site/ArticlesNewspaper";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ProjectsSwipe } from "@/components/site/ProjectsSwipe";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Wrench,
  Check,
  Cctv,
  ScanFace,
  Construction,
  Layers,
} from "lucide-react";
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
import {
  Section,
  Steps,
  seo,
  ContactNotice,
  ConsultLink,
  UsefulArticles,
} from "@/components/site/blocks";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [projects, { articles }] = await Promise.all([getProjects(), getArticles()]);
    return { projects, articles: articles.slice(0, 3) };
  },
  head: () => ({
    ...seo(
      "Монтаж и обслуживание систем безопасности",
      "Проектирование, поставка оборудования, монтаж и обслуживание систем безопасности: видеонаблюдение, СКУД, шлагбаумы и комплексные системы.",
      { geo: true },
    ),
  }),
  component: Index,
});

function Index() {
  const { services, faq, directions } = useSite();
  const { projects, articles } = Route.useLoaderData();
  return (
    <>
      <section className="surface-ink relative overflow-hidden">
        <Picture
          pic={pics.hero}
          alt="Камеры на фасаде здания"
          priority
          className="hero-kenburns hero-pic hero-pic-home absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-fade absolute inset-0" />
        <div className="hero-scan absolute inset-x-0 top-0 hidden lg:block" />
        <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-8 sm:pt-12 sm:pb-10 lg:px-8 lg:pt-14 lg:pb-18">
          <div className="max-w-3xl animate-rise">
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
              <ConsultLink />
            </div>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-3 lg:grid-cols-3">
            {directions.map((d) => (
              <li key={d.slug}>
                <DirectionLink
                  slug={d.slug}
                  className="dir-btn group flex h-full items-center gap-2.5 rounded-lg px-2.5 py-3 text-xs font-medium sm:gap-3 sm:px-4 sm:py-4 sm:text-sm lg:py-6"
                >
                  <DirectionIcon slug={d.slug} />
                  <span className="min-w-0 flex-1">{d.title}</span>
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1 sm:block" />
                </DirectionLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Section eyebrow="Клиенты" title="Решения для разных категорий клиентов" dark>
        <Segments
          cards={[
            {
              art: segmentArt.business,
              title: "Для бизнеса",
              items: businessObjects.slice(0, 6).map((o) => o.title),
              to: "/business",
            },
            {
              art: segmentArt.residential,
              title: "Для жилых комплексов",
              items: residentialObjects,
              to: "/residential",
            },
            {
              art: segmentArt.private,
              title: "Для частных клиентов",
              items: homeObjects,
              to: "/private",
            },
          ]}
        />
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
              <Link to="/maintenance" hash="form" className="btn btn-ghost-ink glass-btn-lg">
                Обсудить договор
              </Link>
            </div>
          </div>
          <Picture
            pic={pics.maintenance}
            alt="Мастер обслуживает уличную камеру видеонаблюдения на фасаде дома"
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
        <PopularServices items={services.slice(0, 8)} />
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
          <Link to="/contacts" className="adv-cta group block p-7">
            <h3 className="text-lg">Обсудим вашу задачу</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Расскажите об объекте — подскажем решение и порядок работ.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#5fe3f5] group-hover:underline">
              Заказать консультацию →
            </p>
          </Link>
        </div>
      </Section>

      {projects.length > 0 && (
        <Section eyebrow="Портфолио" title="Наши объекты">
          <div className="sm:hidden">
            <ProjectsSwipe items={projects.slice(0, 6)} />
          </div>
          <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((p) => (
              <ProjectCard key={p.slug} p={p} />
            ))}
          </div>
          <Link to="/projects" className="btn btn-outline mt-8">
            Все объекты
          </Link>
        </Section>
      )}

      <Section eyebrow="Как мы работаем" title="Этапы работы" compactLg>
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Сотрудничество" title="Варианты сотрудничества">
        <Cooperation />
      </Section>

      <ArticlesNewspaper items={articles} />

      <Section eyebrow="Вопросы" title="Популярные вопросы">
        <HomeFaq items={faq} />
      </Section>

      <Section id="contacts" eyebrow="Контакты" title="Связаться с нами">
        <div className="max-w-3xl">
          <ContactNotice />
        </div>
      </Section>
    </>
  );
}

type Segment = {
  art: string;
  title: string;
  items: string[];
  to: "/business" | "/private" | "/residential";
};

/**
 * Карточки категорий клиентов. Касание сразу открывает страницу категории, карточка подсвечивается,
 * пока палец на ней (как на внутренних страницах). На компьютере — подсветка при наведении.
 */
function Segments({ cards }: { cards: Segment[] }) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.title}
          onClick={(e) => {
            // кнопка «Подробнее» переходит сама
            if ((e.target as HTMLElement).closest("a")) return;
            void navigate({ to: c.to });
          }}
          className="seg-card seg-compact tap-card-ink cursor-pointer flex flex-col rounded-2xl border border-ink-line bg-ink-raised p-8"
        >
          <span className="seg-art" aria-hidden dangerouslySetInnerHTML={{ __html: c.art }} />
          <h3 className="mt-2 text-2xl lg:min-h-[4.5rem]">{c.title}</h3>
          <ul className="mt-6 flex-1 space-y-3">
            {c.items.map((item) => (
              <li key={item} className="flex gap-3 text-ink-foreground/90">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          <Link to={c.to} className="btn btn-primary mt-8 self-start">
            Подробнее <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}

/** «Популярные услуги»: касание подсвечивает карточку и сразу открывает услугу. */
function PopularServices({ items }: { items: { slug: string; title: string; short: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <Link
          key={s.slug}
          to="/services/$slug"
          params={{ slug: s.slug }}
          className="tap-card group rounded-xl border bg-card p-6 shadow-card"
        >
          <h3 className="font-sans text-base font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{s.short}</p>
          <ArrowRight className="mt-4 h-4 w-4 text-primary transition group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  );
}

const cooperation = [
  ["Разовый заказ", "Проектирование, монтаж, диагностика или ремонт — отдельной работой."],
  ["Под ключ", "Обследование, проект, поставка, монтаж, настройка и сдача системы."],
  [
    "Договор обслуживания",
    "Регулярный контроль и поддержка системы по согласованному составу работ.",
  ],
] as const;

/** «Варианты сотрудничества»: подсветка при касании (на компьютере — при наведении), без перехода. */
function Cooperation() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {cooperation.map(([t, d]) => (
        <div key={t} className="tap-card rounded-xl border bg-card p-7 shadow-card">
          <h3 className="text-lg">{t}</h3>
          <p className="mt-2 text-muted-foreground">{d}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * «Популярные вопросы» на главной: касание подсвечивает вопрос и сразу раскрывает ответ;
 * открыт только один ответ.
 */
function HomeFaq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={f.q} className="tap-card tap-card-wide rounded-xl border bg-card shadow-card">
          <button
            type="button"
            aria-expanded={open === i}
            aria-controls={`faq-a-${i}`}
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium"
          >
            {f.q}
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <p id={`faq-a-${i}`} className="px-5 pb-5 text-muted-foreground">
              {f.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Значок направления на первом экране; для новых направлений из админки — щит по умолчанию
const directionIcons: Record<string, typeof Cctv> = {
  videonablyudenie: Cctv,
  skud: ScanFace,
  shlagbaumy: Construction,
  "kompleksnye-sistemy": ShieldCheck,
  obsluzhivanie: Wrench,
  dopolnitelnye: Layers,
};

function DirectionIcon({ slug }: { slug: string }) {
  const Icon = directionIcons[slug] ?? ShieldCheck;
  return (
    <span className="dir-ic" aria-hidden="true">
      <Icon />
    </span>
  );
}
