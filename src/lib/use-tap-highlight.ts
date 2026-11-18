import { useEffect, useRef, useState, type PointerEvent } from "react";

/**
 * Выделение элемента касанием: мгновенно при первом прикосновении (в том числе в начале прокрутки),
 * касание другого элемента переносит выделение, уход выделенного с экрана снимает его.
 * firstTouch() — касание пришлось на ещё не выделенный элемент (его действие пропускаем).
 */
export function useTapHighlight<T extends HTMLElement>() {
  const [active, setActive] = useState<number | null>(null);
  const refs = useRef<(T | null)[]>([]);
  const press = useRef({ touch: false, wasActive: false });

  useEffect(() => {
    if (active === null) return;
    const el = refs.current[active];
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry.isIntersecting) setActive(null);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  const bind = (i: number) => ({
    ref: (el: T | null) => {
      refs.current[i] = el;
    },
    "data-active": active === i,
    onPointerDown: (e: PointerEvent) => {
      press.current = { touch: e.pointerType !== "mouse", wasActive: active === i };
      setActive(i);
    },
  });

  return { active, bind, firstTouch: () => press.current.touch && !press.current.wasActive };
}
