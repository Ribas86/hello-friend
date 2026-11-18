// Движок калькулятора: чистые функции без обращения к сети. Цены и коэффициенты приходят из CMS.
//
// Формула:  Итого = (Σ позиций по правилам) × K_объекта × Π K_условий + D
//           Диапазон = Итого × (1 ± разброс %), min округляется вниз, max вверх до 100 ₽.

export type Option = { id: number; label: string; valueNumber: number | null };
export type Question = {
  id: number;
  text: string;
  kind: "single" | "multi" | "number" | "yesno";
  unit: string | null;
  required: boolean;
  /** Вопрос показывается только если выбран этот вариант ответа */
  showIfOption: number | null;
  options: Option[];
};
export type Scenario = {
  id: number;
  title: string;
  description: string;
  /** Коэффициент объекта K_obj */
  coefficient: number;
  questions: Question[];
};
export type PriceItem = { id: number; title: string; price: number };
export type Rule = {
  optionId: number | null;
  questionId: number | null;
  priceItemId: number;
  formula: "fixed" | "per_unit" | "per_area_step" | "yes_no";
  multiplier: number;
  step: number | null;
};
export type Settings = {
  rangePercent: number;
  /** Постоянная добавка D (выезд, доставка) */
  fixedExtra: number;
  /** Коэффициенты условий: id варианта ответа → коэффициент */
  conditionCoefficients: Record<string, number>;
};
/** Ответы: single → id варианта, multi → id вариантов, number → число, yesno → true/false */
export type Answers = Record<number, number | number[] | boolean>;

export type Line = { title: string; amount: number };
export type CalcResult =
  | { ok: true; min: number; max: number; total: number; lines: Line[] }
  | { ok: false; reason: "missing"; missing: number[] }
  | { ok: false; reason: "no_prices" };

const selectedOf = (q: Question, a: Answers[number] | undefined): number[] =>
  q.kind === "single" && typeof a === "number"
    ? [a]
    : q.kind === "multi" && Array.isArray(a)
      ? a
      : [];

/** Вопросы, которые видны при данных ответах (скрытые и их ответы не учитываются). */
export function visibleQuestions(s: Scenario, answers: Answers): Question[] {
  const chosen = new Set<number>();
  const out: Question[] = [];
  for (const q of s.questions) {
    if (q.showIfOption !== null && !chosen.has(q.showIfOption)) continue;
    out.push(q);
    for (const id of selectedOf(q, answers[q.id])) chosen.add(id);
  }
  return out;
}

const isAnswered = (q: Question, a: Answers[number] | undefined): boolean =>
  q.kind === "number"
    ? typeof a === "number" && Number.isFinite(a) && a >= 0
    : q.kind === "yesno"
      ? typeof a === "boolean"
      : selectedOf(q, a).length > 0;

const money = (n: number) => Math.round(n * 100) / 100;

export function calculate(
  scenario: Scenario,
  answers: Answers,
  rules: Rule[],
  items: PriceItem[],
  settings: Settings,
): CalcResult {
  const visible = visibleQuestions(scenario, answers);
  const missing = visible
    .filter((q) => q.required && !isAnswered(q, answers[q.id]))
    .map((q) => q.id);
  if (missing.length) return { ok: false, reason: "missing", missing };

  const price = new Map(items.map((i) => [i.id, i]));
  const lines: Line[] = [];
  const chosen = new Set<number>();

  for (const q of visible) {
    const a = answers[q.id];
    const picked = selectedOf(q, a);
    picked.forEach((id) => chosen.add(id));
    for (const r of rules) {
      const item = price.get(r.priceItemId);
      if (!item) continue;
      const add = (qty: number) => {
        const amount = money(qty * item.price * r.multiplier);
        if (amount > 0) lines.push({ title: item.title, amount });
      };
      const byOption = r.optionId !== null && picked.includes(r.optionId);
      const byQuestion = r.optionId === null && r.questionId === q.id;
      if (r.formula === "fixed" && (byOption || (byQuestion && isAnswered(q, a)))) add(1);
      else if (r.formula === "per_unit") {
        if (byOption) {
          add(q.options.find((o) => o.id === r.optionId)?.valueNumber ?? 1);
        } else if (byQuestion && typeof a === "number") add(a);
      } else if (r.formula === "per_area_step" && byQuestion && typeof a === "number") {
        if (r.step && r.step > 0 && a > 0) add(Math.ceil(a / r.step));
      } else if (r.formula === "yes_no" && byQuestion && a === true) add(1);
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  if (subtotal <= 0) return { ok: false, reason: "no_prices" };

  let k = scenario.coefficient || 1;
  for (const id of chosen) k *= settings.conditionCoefficients[String(id)] ?? 1;
  const total = money(subtotal * k + settings.fixedExtra);
  const spread = settings.rangePercent / 100;
  return {
    ok: true,
    total,
    min: Math.floor((total * (1 - spread)) / 100) * 100,
    max: Math.ceil((total * (1 + spread)) / 100) * 100,
    lines,
  };
}
