import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { getService, services } from "@/lib/site";
import { PageHero, Section, Steps, Faq, seo } from "@/components/site/blocks";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo(loaderData.service.title, `${loaderData.service.short} ${loaderData.service.description}`.slice(0, 160))
      : { meta: [{ title: "Услуга не найдена" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const { service: s } = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow="Услуга" title={s.title} lead={s.description}>
        <a href="#form" className="btn btn-primary">Оставить заявку</a>
        <Link to="/calculator" className="btn btn-ghost-ink">Получить расчёт</Link>
      </PageHero>
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-7 shadow-card">
            <h2 className="text-xl">Кому подходит</h2>
            <p className="mt-3 text-muted-foreground">{s.audience}</p>
          </div>
          <div className="rounded-xl border bg-card p-7 shadow-card">
            <h2 className="text-xl">Возможный состав работ</h2>
            <ul className="mt-3 space-y-2">
              {s.works.map((w) => <li key={w} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-primary" />{w}</li>)}
            </ul>
          </div>
        </div>
      </Section>
      <Section eyebrow="Этапы" title="Как выполняется работа">
        <Steps items={s.steps} />
        <p className="mt-6 max-w-3xl text-muted-foreground">
          Профессиональный подход позволяет заранее определить состав работ и бюджет, избежать переделок и получить систему, которую удобно обслуживать.
        </p>
      </Section>
      <Section eyebrow="Вопросы" title="Частые вопросы">
        <Faq items={s.faq} />
      </Section>
      <Section eyebrow="Связанные услуги" title="Также может понадобиться">
        <div className="grid gap-4 sm:grid-cols-3">
          {s.related.map((slug) => {
            const r = services.find((x) => x.slug === slug);
            if (!r) return null;
            return (
              <Link key={slug} to="/services/$slug" params={{ slug }} className="rounded-xl border bg-card p-5 shadow-card hover:border-primary">
                <p className="font-semibold">{r.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.short}</p>
              </Link>
            );
          })}
        </div>
      </Section>
      <Section id="form" eyebrow="Заявка" title="Обсудить задачу">
        <div className="max-w-3xl"><LeadForm defaultService={s.title} submitLabel="Отправить заявку" /></div>
      </Section>
    </>
  );
}
