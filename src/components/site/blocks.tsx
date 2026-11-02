import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

export function PageHero({ eyebrow, title, lead, image, children }: { eyebrow?: string; title: string; lead?: string; image?: string; children?: ReactNode }) {
  return (
    <section className="surface-ink relative overflow-hidden">
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" width={1280} height={896} />}
      <div className={image ? "hero-fade absolute inset-0" : "grid-lines absolute inset-0 opacity-25"} />
      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="max-w-3xl animate-rise">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="text-3xl leading-tight sm:text-5xl">{title}</h1>
          {lead && <p className="mt-5 max-w-2xl text-lg text-ink-muted">{lead}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function Section({ eyebrow, title, lead, children, dark, id }: { eyebrow?: string; title?: string; lead?: string; children: ReactNode; dark?: boolean; id?: string }) {
  return (
    <section id={id} className={dark ? "surface-ink" : ""}>
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        {(eyebrow || title) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {title && <h2 className="text-2xl sm:text-4xl">{title}</h2>}
            {lead && <p className={`mt-4 text-lg ${dark ? "text-ink-muted" : "text-muted-foreground"}`}>{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function Steps({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-5" style={dark ? { borderColor: "var(--color-ink-line)" } : undefined}>
      {items.map((s, i) => (
        <li key={s} className={`p-5 ${dark ? "bg-ink-raised" : "bg-card"}`}>
          <span className="font-display text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
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
          <Link to="/calculator" className="btn btn-primary">Получить расчёт</Link>
          <Link to="/contacts" className="btn btn-ghost-ink">Заказать консультацию</Link>
        </div>
      </div>
    </section>
  );
}

export function seo(title: string, description: string) {
  const t = `${title} — Центр Квелити`;
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
