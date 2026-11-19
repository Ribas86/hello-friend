import { region } from "@/lib/site";
import { useSite } from "@/lib/use-site";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { getSiteContent } from "@/lib/cms.functions";
import { MAINTENANCE_DIRECTION } from "@/lib/site";
import { PageHero, Section, Steps, Faq, seo, ContactNotice } from "@/components/site/blocks";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const { services, directions } = await getSiteContent();
    const service = services.find((x) => x.slug === params.slug);
    if (!service) throw notFound();
    return { service, direction: directions.find((d) => d.slug === service.direction) ?? null };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo(
          loaderData.service.title,
          `${loaderData.service.short} ${loaderData.service.description}`,
          { geo: true },
        )
      : { meta: [{ title: "Услуга не найдена" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const { service: s, direction } = Route.useLoaderData();
  const { services, company, baseUrl } = useSite();
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.description || s.short,
    url: `${baseUrl}/services/${s.slug}`,
    provider: { "@type": "Organization", name: company.name, url: baseUrl },
    areaServed: region.areaServed.map((name) => ({ "@type": "AdministrativeArea", name })),
    ...(direction ? { serviceType: direction.title } : {}),
  };
  return (
    <>
      <PageHero
        title={s.title}
        lead={s.description}
        crumbs={[
          { label: "Услуги", href: "/services" },
          ...(direction
            ? [
                {
                  label: direction.title,
                  href:
                    direction.slug === MAINTENANCE_DIRECTION
                      ? "/maintenance"
                      : `/directions/${direction.slug}`,
                },
              ]
            : []),
          { label: s.title },
        ]}
      >
        <a href="#contacts" className="btn btn-primary">
          Связаться с нами
        </a>
        <Link to="/calculator" className="btn btn-ghost-ink">
          Получить расчёт
        </Link>
      </PageHero>
      <Section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
        <div className={s.audience ? "grid items-start gap-8 lg:grid-cols-2" : "grid gap-8"}>
          {s.audience && (
            <div className="rounded-xl border bg-card p-7 shadow-card">
              <h2 className="text-xl">Кому подходит</h2>
              <p className="mt-3 text-muted-foreground">{s.audience}</p>
            </div>
          )}
          <div className="rounded-xl border bg-card p-7 shadow-card">
            <h2 className="text-xl">Возможный состав работ</h2>
            <ul className="mt-3 space-y-2">
              {s.works.map((w) => (
                <li key={w} className="flex gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      {s.steps.length > 0 && (
        <Section eyebrow="Этапы" title="Как выполняется работа">
          <Steps items={s.steps} />
          <p className="mt-6 max-w-3xl text-muted-foreground">
            Профессиональный подход позволяет заранее определить состав работ и бюджет, избежать
            переделок и получить систему, которую удобно обслуживать.
          </p>
        </Section>
      )}
      {s.faq.length > 0 && (
        <Section eyebrow="Вопросы" title="Частые вопросы">
          <Faq items={s.faq} />
        </Section>
      )}
      {s.related.length > 0 && (
        <Section eyebrow="Связанные услуги" title="Также может понадобиться">
          <div className="grid gap-4 sm:grid-cols-3">
            {s.related.map((slug) => {
              const r = services.find((x) => x.slug === slug);
              if (!r) return null;
              return (
                <Link
                  key={slug}
                  to="/services/$slug"
                  params={{ slug }}
                  className="tap-card rounded-xl border bg-card p-5 shadow-card"
                >
                  <p className="font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.short}</p>
                </Link>
              );
            })}
          </div>
        </Section>
      )}
      <Section id="contacts" eyebrow="Контакты" title="Связаться с нами">
        <div className="max-w-3xl">
          <ContactNotice />
        </div>
      </Section>
    </>
  );
}
