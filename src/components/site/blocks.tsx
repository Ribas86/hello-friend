import { region } from "@/lib/site";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import type { Pic } from "@/lib/images";
import { clip } from "@/lib/utils";
import { Breadcrumbs, Picture, type Crumb } from "./media";

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: Pic;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="surface-ink relative overflow-hidden">
      {image && (
        <Picture
          pic={image}
          alt=""
          priority
          className="hero-pic absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        className={image ? "hero-fade absolute inset-0" : "grid-lines absolute inset-0 opacity-25"}
      />
      <div className="relative mx-auto max-w-7xl px-5 pt-6 pb-12 lg:px-8 lg:pt-12 lg:pb-20">
        <div className="max-w-3xl animate-rise">
          {crumbs && <Breadcrumbs items={crumbs} />}
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="text-3xl leading-tight sm:text-5xl">{title}</h1>
          {lead && <p className="mt-5 max-w-2xl text-lg text-ink-muted">{lead}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function Section({
  eyebrow,
  title,
  lead,
  children,
  dark,
  id,
  compactLg,
}: {
  eyebrow?: string;
  title?: string;
  lead?: string;
  children: ReactNode;
  dark?: boolean;
  id?: string;
  /** Компьютер: меньше отступы раздела и заголовка. */
  compactLg?: boolean;
}) {
  return (
    <section
      id={id}
      className={[dark ? "surface-ink" : "", compactLg ? "section-compact-lg" : ""]
        .join(" ")
        .trim()}
    >
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        {(eyebrow || title) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {title && <h2 className="text-2xl sm:text-4xl">{title}</h2>}
            {lead && (
              <p className={`mt-4 text-lg ${dark ? "text-ink-muted" : "text-muted-foreground"}`}>
                {lead}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// На компьютере столько колонок, чтобы в последнем ряду не оставалось пустых серых ячеек
// (4 этапа — 4 колонки, 6 — 3 колонки и т. д.). Классы перечислены целиком, чтобы их увидел Tailwind.
const STEPS_LG_COLS = [
  "",
  "lg:grid-cols-1",
  "lg:grid-cols-2",
  "lg:grid-cols-3",
  "lg:grid-cols-4",
  "lg:grid-cols-5",
];
function stepsLgCols(n: number): string {
  if (n <= 5) return STEPS_LG_COLS[Math.max(n, 1)] ?? "lg:grid-cols-5";
  let best = 5;
  let bestEmpty = Infinity;
  for (const cols of [5, 4, 3]) {
    const empty = (cols - (n % cols)) % cols;
    if (empty < bestEmpty) {
      best = cols;
      bestEmpty = empty;
    }
  }
  return STEPS_LG_COLS[best] ?? "lg:grid-cols-5";
}

export function Steps({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ol
      className={`grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 ${stepsLgCols(items.length)} ${dark ? "" : "steps-light"}`}
      style={dark ? { borderColor: "var(--color-ink-line)" } : undefined}
    >
      {items.map((s, i) => (
        <li
          key={s}
          className={`p-5 ${dark ? "bg-ink-raised text-ink-foreground" : "bg-card text-card-foreground"}`}
        >
          <span className="font-display text-sm text-primary">
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="mt-2 text-sm font-medium">{s}</p>
        </li>
      ))}
    </ol>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y rounded-xl border bg-card">
      {items.map((f) => (
        <details key={f.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {f.q}
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({ title, text }: { title: string; text?: string }) {
  return (
    <section className="surface-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 md:flex-row md:items-center lg:px-8">
        <div>
          <h2 className="text-2xl sm:text-3xl">{title}</h2>
          {text && <p className="mt-2 text-ink-muted">{text}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/calculator" className="btn btn-primary">
            Получить расчёт
          </Link>
          <ConsultLink />
        </div>
      </div>
    </section>
  );
}

/** geo: добавить регион в title и описание (для коммерческих страниц) */
export function seo(title: string, description: string, opts: { geo?: boolean } = {}) {
  const base = title.replace(/ — Центр Квэлити$/, "");
  const withGeo = opts.geo ? `${base} ${region.inTitle}` : base;
  const t = `${withGeo} — Центр Квэлити`;
  const suffix = opts.geo ? ` ${region.full}.` : "";
  description = clip(description, 160 - suffix.length) + suffix;
  return {
    meta: [
      { title: t },
      { name: "description", content: description },
      { property: "og:title", content: t },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}

export function ContactNotice({ withCalculator = true }: { withCalculator?: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-7 shadow-card">
      <p className="font-semibold">Контактные данные скоро появятся на сайте</p>
      <p className="mt-2 text-muted-foreground">
        Пока вы можете рассчитать предварительную стоимость в калькуляторе: регистрация и отправка
        данных не нужны.
      </p>
      {withCalculator && (
        <Link to="/calculator" className="btn btn-primary mt-5">
          Рассчитать стоимость
        </Link>
      )}
    </div>
  );
}

/** Кнопка «Заказать консультацию»: стекло и подсветка как у кнопок направлений на главной. */
export function ConsultLink() {
  return (
    <Link to="/contacts" className="btn dir-btn">
      Заказать консультацию
    </Link>
  );
}

/** «Полезные статьи» на страницах направления и услуги: 2–3 статьи той же темы. Без статей блок не выводится. */
export function UsefulArticles({
  items,
  topic,
}: {
  items: { slug: string; title: string; summary: string }[];
  topic: { slug: string; title: string };
}) {
  if (items.length === 0) return null;
  return (
    <Section eyebrow="Полезные статьи" title="Читайте по теме">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <Link
            key={a.slug}
            to="/articles/$slug"
            params={{ slug: a.slug }}
            className="tap-card group flex flex-col rounded-xl border bg-card p-6 shadow-card"
          >
            <p className="font-sans text-lg font-semibold leading-snug">{a.title}</p>
            {a.summary && (
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{clip(a.summary, 140)}</p>
            )}
            <span className="mt-4 text-sm font-semibold text-primary">Читать статью →</span>
          </Link>
        ))}
      </div>
      <Link to="/articles" search={{ topic: topic.slug }} className="btn btn-outline mt-8">
        Все статьи по теме «{topic.title}»
      </Link>
    </Section>
  );
}
