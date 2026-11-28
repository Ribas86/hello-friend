import { useEffect, useRef, useState } from "react";

/**
 * Этапы на линии-«кабеле»: по мере прокрутки по линии идёт голубой сигнал,
 * пройденные этапы загораются. При «уменьшении движения» всё горит сразу.
 */
export function StepsSignal({ items, dark }: { items: string[]; dark?: boolean | undefined }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(0);
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const nodes = Array.from(list.querySelectorAll<HTMLElement>("[data-node]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const update = () => {
      const top = list.getBoundingClientRect().top;
      // этап «пройден», когда его метка поднялась выше 65% высоты экрана
      const line = reduce ? Infinity : window.innerHeight * 0.65;
      let n = 0;
      let px = 0;
      for (const node of nodes) {
        const r = node.getBoundingClientRect();
        if (r.top + r.height / 2 > line) break;
        n += 1;
        px = r.top + r.height / 2 - top;
      }
      setReached(n);
      setFill(px);
    };

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <ol ref={listRef} className="relative">
      <span
        className={`absolute top-3 bottom-3 left-[9px] w-1 rounded-full ${dark ? "bg-ink-line" : "bg-border"}`}
      />
      <span
        className="absolute top-0 left-[9px] w-1 rounded-full bg-gradient-to-b from-[#00a9c2] to-[#5fe3f5] shadow-[0_0_12px_#5fe3f5] transition-[height] duration-300 ease-out"
        style={{ height: fill }}
      />
      {items.map((s, i) => {
        const on = i < reached;
        return (
          <li key={s} className="relative flex items-start gap-4 py-2">
            <span
              data-node
              className={`relative z-[1] mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 text-[10px] font-bold transition-colors duration-300 ${
                on
                  ? "border-[#00a9c2] bg-[#00a9c2] text-white shadow-[0_0_10px_rgb(0_169_194/.6)]"
                  : dark
                    ? "border-ink-line bg-ink text-ink-muted"
                    : "border-border bg-background text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-sm font-medium transition-colors duration-300 ${on ? "" : dark ? "text-ink-muted" : "text-muted-foreground"}`}
            >
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
