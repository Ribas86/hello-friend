import { Link } from "@tanstack/react-router";
import { Cctv } from "lucide-react";
import { useRef, useState } from "react";
import type { ProjectSummary } from "@/lib/projects.functions";

/**
 * Превью объектов для телефона: крупное фото, название поверх, листание свайпом влево-вправо.
 * Справа виден край следующей карточки, снизу — точки текущей позиции.
 */
export function ProjectsSwipe({ items }: { items: ProjectSummary[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = first.offsetWidth + 16;
    setIndex(Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  };
  const goTo = (i: number) => {
    const el = track.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={track}
        onScroll={onScroll}
        className="swipe-track -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2"
      >
        {items.map((p) => (
          <Link
            key={p.slug}
            to="/projects/$slug"
            params={{ slug: p.slug }}
            className="relative block aspect-[4/5] w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl bg-ink shadow-card"
          >
            {p.cover ? (
              <img
                src={`${p.cover}?w=800`}
                alt={p.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-primary/40">
                <Cctv className="h-12 w-12" aria-hidden />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-5 pt-16">
              <h3 className="font-sans text-lg font-semibold leading-snug text-white">{p.title}</h3>
            </div>
          </Link>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Объекты">
          {items.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Объект ${i + 1} из ${items.length}`}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-2.5 bg-border"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
