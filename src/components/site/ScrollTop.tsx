import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/** Кнопка «наверх»: появляется после прокрутки на экран вниз, плавно возвращает в начало страницы. */
export function ScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Наверх"
      title="Наверх"
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      className={`scroll-top fixed right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground sm:right-6 ${visible ? "is-visible" : ""}`}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
