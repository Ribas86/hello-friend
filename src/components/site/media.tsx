import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { Pic } from "@/lib/images";
import { MAINTENANCE_DIRECTION } from "@/lib/site";
import { useSite } from "@/lib/use-site";

export function Picture({
  pic,
  alt,
  className,
  sizes = "100vw",
  priority = false,
}: {
  pic: Pic;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <picture className="contents">
      <source type="image/webp" srcSet={pic.webp} sizes={sizes} />
      <img
        src={pic.src}
        alt={alt}
        width={pic.width}
        height={pic.height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        {...(priority ? { fetchPriority: "high" as const } : {})}
      />
    </picture>
  );
}

/** Ссылка на направление. «Обслуживание» ведёт на страницу /maintenance, чтобы не было двух страниц на одну тему. */
export function DirectionLink({
  slug,
  className,
  onClick,
  children,
}: {
  slug: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return slug === MAINTENANCE_DIRECTION ? (
    <Link to="/maintenance" className={className} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <Link to="/directions/$slug" params={{ slug }} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export type Crumb = { label: string; href?: string };

/** Хлебные крошки: видимая навигация и разметка BreadcrumbList для поисковиков. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { baseUrl } = useSite();
  const all: Crumb[] = [{ label: "Главная", href: "/" }, ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: baseUrl + c.href } : {}),
    })),
  };
  // Видимая цепочка без последнего звена: название текущей страницы и так в заголовке.
  // Всегда одна строка, длинные названия сокращаются многоточием.
  const visible = all.slice(0, -1);
  return (
    <nav aria-label="Навигационная цепочка" className="mb-4 text-sm text-ink-muted">
      <ol className="flex min-w-0 items-center gap-1 whitespace-nowrap">
        {visible.map((c, i) => (
          <li key={i} className={`flex items-center gap-1 ${i === 0 ? "shrink-0" : "min-w-0"}`}>
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            <a
              href={c.href}
              title={c.label}
              className="block truncate py-1 hover:text-ink-foreground"
            >
              {c.label}
            </a>
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}
