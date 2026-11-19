import { legal, region } from "@/lib/site";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  redirect,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { getSiteContent } from "@/lib/cms.functions";
import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScrollTop } from "@/components/site/ScrollTop";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Такой страницы нет или она была перемещена.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn btn-primary">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Страница не загрузилась
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Что-то пошло не так. Попробуйте обновить страницу.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn btn-primary"
          >
            Попробовать снова
          </button>
          <a href="/" className="btn btn-outline">
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    const site = await getSiteContent();
    const hit = site.redirects.find((x) => x.from === location.pathname);
    if (hit && hit.to !== location.pathname) {
      throw redirect({ href: hit.to, statusCode: hit.status });
    }
    return { site };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Центр Квэлити — системы безопасности" },
      {
        name: "description",
        content:
          "Проектирование, поставка оборудования, монтаж и обслуживание систем безопасности.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ru_RU" },
      { property: "og:site_name", content: "Центр Квэлити" },
      { name: "theme-color", content: "#162f48" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, site } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const url = site.baseUrl + (pathname === "/" ? "/" : pathname.replace(/\/+$/, ""));
  // iOS Safari показывает :active (подсветку карточек при касании) только если на странице есть обработчик touchstart
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.company.name,
    url: site.baseUrl,
    areaServed: region.areaServed.map((name) => ({ "@type": "AdministrativeArea", name })),
    ...(site.company.phone ? { telephone: site.company.phone } : {}),
    ...(site.company.email ? { email: site.company.email } : {}),
    legalName: legal.fullName,
    taxID: legal.inn,
    address:
      !site.company.address || site.company.address === legal.address
        ? {
            "@type": "PostalAddress",
            postalCode: "127106",
            addressLocality: "Москва",
            streetAddress: "ул. Гостиничная, д. 5",
            addressCountry: "RU",
          }
        : site.company.address,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${site.baseUrl}/og.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {site.noindex && <meta name="robots" content="noindex, nofollow" />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      {site.metrikaId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${site.metrikaId},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});`,
          }}
        />
      )}
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollTop />
    </QueryClientProvider>
  );
}
