import { Link } from "@tanstack/react-router";
import { ArrowRight, Cctv } from "lucide-react";
import type { ProjectSummary } from "@/lib/projects.functions";

export function ProjectCard({ p }: { p: ProjectSummary }) {
  const meta = [p.objectType, p.city, p.year ? String(p.year) : ""].filter(Boolean).join(", ");
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: p.slug }}
      className="tap-card group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card"
    >
      {p.cover ? (
        <img
          src={`${p.cover}?w=800`}
          alt={p.title}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-primary/40">
          <Cctv className="h-10 w-10" aria-hidden />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        <h3 className="mt-1 font-sans text-lg font-semibold leading-snug">{p.title}</h3>
        {p.summary && <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.summary}</p>}
        <ArrowRight className="mt-4 h-4 w-4 text-primary transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
