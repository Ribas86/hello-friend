import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Info } from "lucide-react";
import { PageHero, Section, seo } from "@/components/site/blocks";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/calculator")({
  head: () => seo("Расчёт стоимости видеонаблюдения", "Предварительный расчёт стоимости видеонаблюдения для дома и бизнеса."),
  component: Page,
});

type Params = Record<string, string | number | boolean>;

function Page() {
  const [mode, setMode] = useState<"home" | "business">("home");
  const [p, setP] = useState<Params>({});
  const set = (k: string, v: string | boolean) => setP((s) => ({ ...s, [k]: v }));
  const sel = (k: string, label: string, opts: string[]) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <select className="field" value={(p[k] as string) ?? ""} onChange={(e) => set(k, e.target.value)}>
        <option value="">Не выбрано</option>
        {opts.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
  const num = (k: string, label: string) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input className="field" inputMode="numeric" maxLength={10} value={(p[k] as string) ?? ""} onChange={(e) => set(k, e.target.value.replace(/[^\d]/g, ""))} />
    </div>
  );
  const chk = (k: string, label: string) => (
    <label key={k} className="flex items-center gap-2 text-sm">
      <input type="checkbox" className="h-4 w-4 accent-primary" checked={!!p[k]} onChange={(e) => set(k, e.target.checked)} /> {label}
    </label>
  );

  return (
    <>
      <PageHero eyebrow="Калькулятор" title="Расчёт стоимости" lead="Укажите параметры объекта. Расчёт предварительный: итоговая сумма зависит от обследования и согласованного состава работ." />
      <Section>
        <div className="mb-6 inline-flex rounded-lg border bg-card p-1">
          {(["home", "business"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setP({}); }} className={`rounded-md px-5 py-2.5 text-sm font-semibold ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              {m === "home" ? "Для дома" : "Для бизнеса"}
            </button>
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-4 rounded-xl border bg-card p-6 shadow-card sm:grid-cols-2 sm:p-8">
            {mode === "home" ? (
              <>
                {sel("object", "Тип объекта", ["Квартира", "Дом", "Дача", "Гараж", "Участок"])}
                {num("cameras", "Количество камер")}
                {sel("system", "Тип системы", ["IP", "Аналоговая", "Не знаю"])}
                <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
                  {chk("recorder", "Нужен видеорегистратор")}
                  {chk("archive", "Нужно хранение архива")}
                  {chk("mobile", "Просмотр со смартфона")}
                  {chk("cable", "Прокладка кабеля")}
                  {chk("install", "Монтаж")}
                  {chk("setup", "Настройка")}
                </div>
              </>
            ) : (
              <>
                {sel("object", "Тип объекта", ["Офис", "Склад", "Магазин", "Производство", "Парковка", "Другой объект"])}
                {num("area", "Площадь, м²")}
                {num("cameras", "Количество камер")}
                {num("buildings", "Зданий / площадок")}
                {sel("storage", "Хранение архива", ["7 дней", "14 дней", "30 дней", "Более 30 дней", "Не знаю"])}
                {sel("recorder", "Запись", ["Видеорегистратор", "Сервер", "Не знаю"])}
                <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
                  {chk("design", "Нужно проектирование")}
                  {chk("install", "Монтаж")}
                  {chk("integration", "Интеграция с существующей системой")}
                  {chk("maintenance", "Регулярное обслуживание")}
                </div>
              </>
            )}
          </div>
          <div className="surface-ink rounded-xl p-7">
            <p className="eyebrow">Результат</p>
            <div className="mt-4 flex gap-3 rounded-lg border border-ink-line bg-ink-raised p-4 text-sm">
              <Info className="h-5 w-5 shrink-0 text-primary" />
              <p>Цены на оборудование и работы ещё не внесены компанией, поэтому автоматический расчёт пока недоступен. Оставьте заявку — выбранные параметры сохранятся, и инженер подготовит расчёт.</p>
            </div>
            {mode === "business" && Number(p["cameras"]) > 32 && (
              <p className="mt-4 text-sm text-ink-muted">Для крупных объектов мы готовим индивидуальный расчёт.</p>
            )}
          </div>
        </div>
      </Section>
      <Section id="form" title="Запросить индивидуальный расчёт">
        <div className="max-w-3xl">
          <LeadForm
            key={mode}
            variant={mode}
            submitLabel="Запросить индивидуальный расчёт"
            extraDetails={{ calculator: mode, ...p }}
          />
        </div>
      </Section>
    </>
  );
}
