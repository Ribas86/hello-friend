import { useSite } from "@/lib/use-site";
import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo(
      "Политика обработки персональных данных",
      "Как ООО «Центр Квелити» обрабатывает персональные данные, полученные через формы сайта.",
    ),
  component: Page,
});

function Page() {
  const { company } = useSite();
  return (
    <>
      <PageHero title="Политика обработки персональных данных" />
      <Section>
        <div className="max-w-3xl space-y-4 text-muted-foreground">
          <p>Оператор персональных данных — {company.name}. Реквизиты оператора будут добавлены.</p>
          <p>
            Через формы сайта мы получаем имя, телефон и сведения об объекте, которые вы указываете
            сами. Эти данные используются только для связи с вами, подготовки расчёта и оказания
            услуг.
          </p>
          <p>
            Данные не передаются третьим лицам, кроме случаев, предусмотренных законом. Вы можете
            запросить изменение или удаление своих данных, связавшись с нами.
          </p>
          <p className="text-sm">
            Текст является предварительным и должен быть согласован юристом компании перед
            публикацией.
          </p>
        </div>
      </Section>
    </>
  );
}
