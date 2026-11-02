import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import img from "@/assets/maintenance.jpg";
import { maintenanceWorks } from "@/lib/site";
import { PageHero, Section, Steps, Faq, seo } from "@/components/site/blocks";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/maintenance")({
  head: () => seo("Техническое обслуживание систем видеонаблюдения", "Плановое обслуживание видеонаблюдения по договору: диагностика, проверка записи и архива, профилактика, восстановление работоспособности."),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHero eyebrow="Ключевое направление" title="Техническое обслуживание систем видеонаблюдения" lead="Регулярный контроль помогает вовремя замечать неисправности, сохранять запись и архив, продлевать срок службы оборудования." image={img}>
        <a href="#form" className="btn btn-primary">Получить предложение по договору</a>
      </PageHero>

      <Section eyebrow="Зачем" title="Почему обслуживание необходимо">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Запись идёт, когда нужна", "Неисправность камеры или накопителя часто обнаруживается только тогда, когда запись понадобилась. Плановые проверки снижают этот риск."],
            ["Меньше внеплановых затрат", "Профилактика и раннее выявление проблем обычно дешевле, чем срочный ремонт."],
            ["Понятное состояние системы", "Вы знаете, что работает, что требует внимания и что стоит модернизировать."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border bg-card p-7 shadow-card">
              <h3 className="text-lg">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Состав работ" title="Что может входить в обслуживание" lead="Конкретный перечень и периодичность согласуются в договоре." dark>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {maintenanceWorks.map((w) => <li key={w} className="flex gap-3 rounded-lg border border-ink-line bg-ink-raised p-4"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" />{w}</li>)}
        </ul>
      </Section>

      <Section eyebrow="Порядок" title="Как начать обслуживание">
        <Steps items={["Заявка", "Обследование текущей системы", "Согласование состава и периодичности", "Заключение договора", "Плановые работы и отчёты"]} />
      </Section>

      <Section eyebrow="Вопросы" title="Частые вопросы">
        <Faq items={[
          { q: "Обслуживаете системы других установщиков?", a: "Да. Начинаем с обследования, чтобы оценить состояние системы и согласовать состав работ." },
          { q: "Как часто проводятся работы?", a: "Периодичность зависит от объекта и согласуется в договоре." },
          { q: "Можно обслуживать несколько объектов?", a: "Да, договор может охватывать несколько объектов организации." },
        ]} />
      </Section>

      <Section id="form" eyebrow="Договор" title="Получить предложение по договору обслуживания">
        <div className="max-w-3xl"><LeadForm variant="maintenance" defaultService="Техническое обслуживание" submitLabel="Получить предложение" /></div>
      </Section>
    </>
  );
}
