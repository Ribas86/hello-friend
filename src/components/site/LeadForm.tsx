import { useState, type FormEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead, type LeadInput } from "@/lib/leads.functions";
import { services } from "@/lib/site";

type Variant = "general" | "business" | "home" | "maintenance";

const objectTypes: Record<Variant, string[]> = {
  general: ["Квартира", "Частный дом", "Дача / участок", "Гараж", "Офис", "Магазин", "Склад", "Производство", "Другое"],
  business: ["Офис / бизнес-центр", "Склад / логистика", "Магазин / ТЦ", "Производство", "Автосервис", "Парковка / территория", "Учреждение", "Другое"],
  home: ["Квартира", "Частный дом / коттедж", "Дача / участок", "Гараж"],
  maintenance: ["Офис", "Склад", "Магазин", "Производство", "Учреждение", "Частный объект", "Другое"],
};

export function LeadForm({
  variant = "general",
  submitLabel = "Получить расчёт",
  defaultService,
  extraDetails,
}: {
  variant?: Variant;
  submitLabel?: string;
  defaultService?: string;
  extraDetails?: Record<string, string | number | boolean>;
}) {
  const submit = useServerFn(submitLead);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => (fd.get(k) as string | null)?.trim() || undefined;
    const details: Record<string, string | number | boolean> = { ...(extraDetails ?? {}) };
    for (const k of ["area", "cameras", "buildings", "terms"]) if (s(k)) details[k] = s(k)!;
    for (const k of ["need_design", "need_install", "need_maintenance"]) if (fd.get(k)) details[k] = true;
    const payload: LeadInput = {
      form_type: variant,
      name: s("name") ?? "",
      phone: s("phone") ?? "",
      company: s("company"),
      object_type: s("object_type"),
      service: s("service"),
      comment: s("comment"),
      details,
      source_page: pathname,
      website: (fd.get("website") as string) || undefined,
      consent: fd.get("consent") ? true : (false as unknown as true),
    };
    setState("sending");
    try {
      await submit({ data: payload });
      setState("done");
    } catch (err) {
      setState("idle");
      const msg = err instanceof Error ? err.message : "";
      try {
        const parsed = JSON.parse(msg);
        setError(Array.isArray(parsed) ? parsed[0]?.message : msg);
      } catch {
        setError(msg || "Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.");
      }
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-primary/40 bg-card p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <p className="mt-4 font-display text-xl">Заявка сохранена</p>
        <p className="mt-2 text-muted-foreground">Мы свяжемся с вами, чтобы уточнить детали.</p>
      </div>
    );
  }

  const label = "mb-1.5 block text-sm font-medium";
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-card sm:grid-cols-2 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <label className={label}>Имя *</label>
        <input name="name" required maxLength={100} className="field" autoComplete="name" />
      </div>
      <div>
        <label className={label}>Телефон *</label>
        <input name="phone" required type="tel" maxLength={30} className="field" autoComplete="tel" placeholder="+7 ..." />
      </div>
      {(variant === "general" || variant === "business" || variant === "maintenance") && (
        <div>
          <label className={label}>{variant === "business" ? "Организация" : "Компания (необязательно)"}</label>
          <input name="company" maxLength={200} className="field" autoComplete="organization" />
        </div>
      )}
      <div>
        <label className={label}>Тип объекта</label>
        <select name="object_type" className="field" defaultValue="">
          <option value="">Не выбрано</option>
          {objectTypes[variant].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      {variant === "general" && (
        <div className="sm:col-span-2">
          <label className={label}>Интересующая услуга</label>
          <select name="service" className="field" defaultValue={defaultService ?? ""}>
            <option value="">Не выбрано</option>
            {services.map((s) => <option key={s.slug}>{s.title}</option>)}
          </select>
        </div>
      )}
      {defaultService && variant !== "general" && <input type="hidden" name="service" value={defaultService} />}
      {(variant === "business" || variant === "home") && (
        <>
          <div>
            <label className={label}>{variant === "home" ? "Площадь / параметры (необязательно)" : "Площадь, м²"}</label>
            <input name="area" maxLength={100} className="field" />
          </div>
          <div>
            <label className={label}>Количество камер{variant === "home" ? ", если известно" : ""}</label>
            <input name="cameras" inputMode="numeric" maxLength={10} className="field" />
          </div>
        </>
      )}
      {variant === "business" && (
        <>
          <div>
            <label className={label}>Зданий / площадок</label>
            <input name="buildings" inputMode="numeric" maxLength={10} className="field" />
          </div>
          <div>
            <label className={label}>Желаемые условия сотрудничества</label>
            <input name="terms" maxLength={300} className="field" placeholder="Разово, договор обслуживания..." />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 sm:col-span-2">
            {[["need_design", "Нужно проектирование"], ["need_install", "Нужен монтаж"], ["need_maintenance", "Нужно регулярное обслуживание"]].map(([n, l]) => (
              <label key={n} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={n} className="h-4 w-4 accent-primary" /> {l}
              </label>
            ))}
          </div>
        </>
      )}
      <div className="sm:col-span-2">
        <label className={label}>Комментарий</label>
        <textarea name="comment" maxLength={2000} rows={3} className="field" />
      </div>
      <label className="flex items-start gap-2 text-sm text-muted-foreground sm:col-span-2">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-primary" />
        <span>
          Согласен на обработку персональных данных в соответствии с{" "}
          <Link to="/privacy" className="text-foreground underline">политикой</Link>
        </span>
      </label>
      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive sm:col-span-2">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary sm:col-span-2 disabled:opacity-60">
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
