import { useSite } from "@/lib/use-site";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { LogoMark } from "./LogoMark";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import { DirectionLink } from "./media";

export function SiteHeader() {
  const { company, directions } = useSite();
  const [open, setOpen] = useState(false);
  // Переход происходит сразу, а меню закрывается чуть позже, чтобы было видно подсветку касания
  const closeSoon = () => window.setTimeout(() => setOpen(false), 180);
  // Пока меню открыто, страница под ним не прокручивается — прокручивается только само меню
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);
  return (
    <header className="surface-ink sticky top-0 z-50 border-b border-ink-line/60 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LogoMark className="h-7 w-7" />
          </span>
          <span className="whitespace-nowrap font-display text-xl font-bold leading-tight">
            {company.short}
            <span className="block text-xs font-medium tracking-widest text-ink-muted uppercase">
              системы безопасности
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1.5 xl:flex">
          {nav
            .filter((n) => n.to !== "/")
            .map((n) => (
              <div key={n.to} className="group relative">
                <Link
                  to={n.to}
                  className="nav-btn block whitespace-nowrap rounded-md border px-3.5 py-2.5 text-[15px]"
                  activeProps={{ className: "nav-btn-active" }}
                >
                  {n.short}
                </Link>
                {n.to === "/services" && directions.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-50 w-72 rounded-lg border border-ink-line bg-ink-raised p-2 opacity-0 shadow-glow transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {directions.map((d) => (
                      <DirectionLink
                        key={d.slug}
                        slug={d.slug}
                        className="block rounded-md px-3 py-2 text-sm text-ink-muted hover:text-primary"
                      >
                        {d.title}
                      </DirectionLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            aria-label="Меню"
            className="rounded-md p-2 text-ink-foreground xl:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        // onTouchStart нужен, чтобы iOS показывал подсветку :active при касании
        <nav
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain border-t border-ink-line/60 px-5 pb-5 xl:hidden"
          onTouchStart={() => {}}
        >
          {nav.map((n) => (
            <div key={n.to}>
              <Link
                to={n.to}
                onClick={closeSoon}
                activeOptions={{ exact: n.to === "/" }}
                className="m-nav block border-b border-ink-line/40 py-3.5 text-base"
                activeProps={{ className: "m-nav-active" }}
              >
                {n.label}
              </Link>
              {n.to === "/services" &&
                directions.map((d) => (
                  <DirectionLink
                    key={d.slug}
                    slug={d.slug}
                    onClick={closeSoon}
                    className="m-nav block border-b border-ink-line/40 py-2.5 pl-4 text-sm text-ink-muted"
                  >
                    {d.title}
                  </DirectionLink>
                ))}
            </div>
          ))}
          <Link
            to="/calculator"
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-4 w-full"
          >
            Получить расчёт
          </Link>
        </nav>
      )}
    </header>
  );
}
