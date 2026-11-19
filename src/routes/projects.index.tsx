import { createFileRoute } from "@tanstack/react-router";
import { getProjects } from "@/lib/projects.functions";
import { PageHero, Section, CtaBand, seo } from "@/components/site/blocks";
import { ProjectCard } from "@/components/site/ProjectCard";

export const Route = createFileRoute("/projects/")({
  loader: () => getProjects(),
  head: () =>
    seo(
      "Наши объекты",
      "Выполненные работы ООО «Центр «Квэлити»»: проектирование, монтаж и обслуживание систем безопасности.",
    ),
  component: Page,
});

function Page() {
  const projects = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="Портфолио"
        title="Наши объекты"
        lead="Выполненные работы: задачи заказчиков, что сделано и какое оборудование установлено."
        crumbs={[{ label: "Наши объекты" }]}
      />
      <Section>
        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <p className="font-display text-xl">Раздел готовится</p>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Скоро здесь появятся объекты, на которых мы работали.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </Section>
      <CtaBand
        title="Нужна похожая система?"
        text="Рассчитайте предварительную стоимость в калькуляторе."
      />
    </>
  );
}
