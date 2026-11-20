import { Link } from "@tanstack/react-router";
import { legal, nav, region } from "@/lib/site";
import { useSite } from "@/lib/use-site";

export function SiteFooter() {
  const { company } = useSite();
  return (
    <footer className="surface-ink border-t border-ink-line/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-3 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-4 lg:px-8 lg:py-7">
        <div className="md:col-span-1 lg:col-start-2 lg:row-start-1">
          <p className="font-display text-lg">{company.name}</p>
          <p className="mt-2 text-sm leading-snug text-ink-muted lg:mt-1">
            Проектирование, поставка оборудования, монтаж и обслуживание систем безопасности{" "}
            {region.inText}.{company.years ? ` ${company.years} лет опыта.` : ""}
          </p>
        </div>
        <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <p className="eyebrow mb-2 lg:mb-1">Разделы</p>
          <ul className="text-sm leading-5 text-ink-muted">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="inline-block py-1 hover:text-primary lg:py-px">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/objects" className="inline-block py-1 hover:text-primary lg:py-px">
                Объекты и решения
              </Link>
            </li>
            <li>
              <Link to="/articles" className="inline-block py-1 hover:text-primary lg:py-px">
                Статьи
              </Link>
            </li>
          </ul>
        </div>
        <div className="lg:col-start-2 lg:row-start-2">
          <p className="eyebrow mb-2 lg:mb-1">Контакты</p>
          <div className="space-y-1 text-sm leading-snug text-ink-muted">
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
            <Link to="/contacts" className="inline-block py-1 text-primary hover:underline">
              Связаться с нами →
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-line/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3 text-xs text-ink-muted sm:flex-row sm:justify-between lg:items-center lg:px-8 lg:py-2">
          <span>
            © {new Date().getFullYear()} {company.name} · ИНН {legal.inn} · ОГРН {legal.ogrn}
          </span>
          <Link to="/privacy" className="inline-block py-1 hover:text-primary">
            Политика обработки персональных данных
          </Link>
        </div>
      </div>
    </footer>
  );
}
