import { Link } from "@tanstack/react-router";
import { company, nav, services } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="surface-ink border-t border-ink-line/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <p className="font-display text-lg">{company.name}</p>
          <p className="mt-3 text-sm text-ink-muted">
            Проектирование, монтаж и техническое обслуживание систем видеонаблюдения.{" "}
            {company.years} лет опыта.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4">Разделы</p>
          <ul className="space-y-2 text-sm text-ink-muted">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-primary">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/objects" className="hover:text-primary">
                Объекты и решения
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Услуги</p>
          <ul className="space-y-2 text-sm text-ink-muted">
            {services.slice(0, 7).map((s) => (
              <li key={s.slug}>
                <Link to="/services/$slug" params={{ slug: s.slug }} className="hover:text-primary">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Контакты</p>
          <p className="text-sm text-ink-muted">
            {company.contactPerson}, {company.contactRole}
          </p>
          <Link to="/contacts" className="mt-3 inline-block text-sm text-primary hover:underline">
            Связаться с нами →
          </Link>
        </div>
      </div>
      <div className="border-t border-ink-line/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-ink-muted sm:flex-row sm:justify-between lg:px-8">
          <span>
            © {new Date().getFullYear()} {company.name}
          </span>
          <Link to="/privacy" className="hover:text-primary">
            Политика обработки персональных данных
          </Link>
        </div>
      </div>
    </footer>
  );
}
