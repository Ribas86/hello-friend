import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, CtaBand, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/articles")({
  head: () =>
    seo(
      "Статьи о видеонаблюдении",
      "Экспертные статьи о выборе, монтаже и обслуживании систем видеонаблюдения для бизнеса и дома.",
    ),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHero
        eyebrow="Статьи"
        title="Статьи о видеонаблюдении"
        lead="Экспертные материалы для бизнеса и частных владельцев."
      />
      <Section>
        <div className="rounded-xl border border-dashed bg-card p-10 text-center">
          <p className="font-display text-xl">Раздел готовится</p>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Первые статьи появятся здесь в ближайшее время.
          </p>
        </div>
      </Section>
      <CtaBand title="Есть вопрос по видеонаблюдению?" text="Задайте его инженеру напрямую." />
    </>
  );
}
