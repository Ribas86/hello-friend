import { createFileRoute } from "@tanstack/react-router";
import { company } from "@/lib/site";
import { PageHero, Section, ContactNotice, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/contacts")({
  head: () =>
    seo(
      "Контакты",
      "Контакты ООО «Центр Квелити»: консультация, расчёт стоимости, обследование объекта и договор обслуживания.",
    ),
  component: Page,
});

function Page() {
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
        </div>
      </Section>
    </>
  );
}
