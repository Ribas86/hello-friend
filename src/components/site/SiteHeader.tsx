import { useSite } from "@/lib/use-site";
import { Link } from "@tanstack/react-router";
import { Menu, X, ScanEye } from "lucide-react";
import { useState } from "react";
import { nav } from "@/lib/site";

export function SiteHeader() {
  const { company, directions } = useSite();
  const [open, setOpen] = useState(false);
  return (
    <header className="surface-ink sticky top-0 z-50 border-b border-ink-line/60 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ScanEye className="h-5 w-5" />
          </span>
          <span className="font-display text-sm font-semibold leading-tight">
            {company.short}
            <span className="block text-[10px] font-normal tracking-widest text-ink-muted uppercase">
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
                  className="block whitespace-nowrap rounded-md border border-ink-line px-3 py-2 text-sm text-ink-muted transition-colors hover:border-primary hover:text-ink-foreground"
                  activeProps={{ className: "!border-primary !bg-primary/15 !text-primary" }}
                >
                  {n.short}
                </Link>
                {n.to === "/services" && directions.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-50 w-72 rounded-lg border border-ink-line bg-ink-raised p-2 opacity-0 shadow-glow transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {directions.map((d) => (
                      <Link
                        key={d.slug}
                        to="/directions/$slug"
                        params={{ slug: d.slug }}
                        className="block rounded-md px-3 py-2 text-sm text-ink-muted hover:text-primary"
                      >
                        {d.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/calculator"
            className="btn btn-primary hidden !min-h-10 whitespace-nowrap !py-2 text-sm sm:inline-flex"
          >
            Получить расчёт
          </Link>
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
        <nav className="border-t border-ink-line/60 px-5 pb-5 xl:hidden">
          {nav.map((n) => (
            <div key={n.to}>
              <Link
                to={n.to}
                onClick={() => setOpen(false)}
                className="block border-b border-ink-line/40 py-3.5 text-base"
              >
                {n.label}
              </Link>
              {n.to === "/services" &&
                directions.map((d) => (
                  <Link
                    key={d.slug}
                    to="/directions/$slug"
                    params={{ slug: d.slug }}
                    onClick={() => setOpen(false)}
                    className="block border-b border-ink-line/40 py-2.5 pl-4 text-sm text-ink-muted"
                  >
                    {d.title}
                  </Link>
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
