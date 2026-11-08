import { createFileRoute } from "@tanstack/react-router";
import { company } from "@/lib/site";
import { PageHero, Section, seo } from "@/components/site/blocks";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/contacts")({
  head: () =>
    seo(
      "Контакты",
      "Свяжитесь с ООО «Центр Квелити»: консультация, расчёт стоимости, обследование объекта и договор обслуживания.",
    ),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Контакты"
        title="Свяжитесь с нами"
        lead="Оставьте заявку — инженер свяжется с вами, ответит на вопросы и поможет с расчётом."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div className="space-y-5">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">Контактное лицо</p>
              <p className="mt-1 font-display text-lg">{company.contactPerson}</p>
              <p className="text-muted-foreground">Главный инженер</p>
            </div>
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
          </div>
          <LeadForm submitLabel="Заказать консультацию" />
        </div>
      </Section>
    </>
  );
}
