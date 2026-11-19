import { useSite } from "@/lib/use-site";
import { legal, region } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, ContactNotice, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/contacts")({
  head: () =>
    seo(
      "Контакты",
      "Контакты ООО «Центр «Квэлити»»: консультация, расчёт стоимости, обследование объекта и договор обслуживания.",
      { geo: true },
    ),
  component: Page,
});

function Page() {
  const { company } = useSite();
  return (
    <>
      <PageHero
        eyebrow="Контакты"
        title="Свяжитесь с нами"
        lead="Контактные данные компании будут опубликованы здесь. Предварительную стоимость можно узнать в калькуляторе."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Регион работы: </span>
              {region.full}
            </p>
            <p>
              <span className="text-muted-foreground">Телефон: </span>
              {company.phone ?? "будет добавлен"}
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              {company.email ?? "будет добавлен"}
            </p>
            <p>
              <span className="text-muted-foreground">Адрес: </span>
              {company.address ?? "будет добавлен"}
            </p>
          </div>
          <ContactNotice />
          <div className="rounded-xl border bg-card p-6 shadow-card text-sm lg:col-start-1">
            <h2 className="mb-3 text-base font-semibold">Реквизиты</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-muted-foreground">Организация</dt>
              <dd>{legal.fullName}</dd>
              <dt className="text-muted-foreground">ИНН</dt>
              <dd>{legal.inn}</dd>
              <dt className="text-muted-foreground">КПП</dt>
              <dd>{legal.kpp}</dd>
              <dt className="text-muted-foreground">ОГРН</dt>
              <dd>{legal.ogrn}</dd>
              <dt className="text-muted-foreground">Юр. адрес</dt>
              <dd>{legal.address}</dd>
            </dl>
          </div>
        </div>
      </Section>
    </>
  );
}
