import { Link } from "@tanstack/react-router";
import { nav } from "@/lib/site";
import { useSite } from "@/lib/use-site";

export function SiteFooter() {
  const { company } = useSite();
  return (
    <footer className="surface-ink border-t border-ink-line/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 lg:px-8">
        <div className="md:col-span-1">
          <p className="font-display text-lg">{company.name}</p>
          <p className="mt-3 text-sm text-ink-muted">
            Проектирование, поставка оборудования, монтаж и обслуживание систем безопасности.
            {company.years ? ` ${company.years} лет опыта.` : ""}
          </p>
        </div>
        <div>
          <p className="eyebrow mb-4">Разделы</p>
          <ul className="space-y-0.5 text-sm text-ink-muted">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="inline-block py-1.5 hover:text-primary">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/objects" className="inline-block py-1.5 hover:text-primary">
                Объекты и решения
              </Link>
            </li>
            <li>
              <Link to="/articles" className="inline-block py-1.5 hover:text-primary">
                Статьи
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Контакты</p>
          <div className="space-y-2 text-sm text-ink-muted">
            {company.phone && (
              <p>
                <a
                  href={`tel:${company.phone.replace(/[^+\d]/g, "")}`}
                  className="hover:text-primary"
                >
                  {company.phone}
                </a>
              </p>
            )}
            {company.email && (
              <p>
                <a href={`mailto:${company.email}`} className="hover:text-primary">
                  {company.email}
                </a>
              </p>
            )}
            {company.address && <p>{company.address}</p>}
            <Link to="/contacts" className="inline-block py-1.5 text-primary hover:underline">
              Связаться с нами →
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-line/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-ink-muted sm:flex-row sm:justify-between lg:px-8">
          <span>
            © {new Date().getFullYear()} {company.name}
          </span>
          <Link to="/privacy" className="inline-block py-1.5 hover:text-primary">
            Политика обработки персональных данных
          </Link>
        </div>
      </div>
    </footer>
  );
}
