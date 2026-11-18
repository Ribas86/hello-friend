/* eslint-disable @typescript-eslint/no-explicit-any -- строки Directus динамические, приводим значения явно в load() */
import { createServerFn } from "@tanstack/react-start";
import {
  calculate,
  type Answers,
  type CalcResult,
  type PriceItem,
  type Rule,
  type Scenario,
  type Settings,
} from "./calc-engine";

type Data = {
  scenarios: Scenario[];
  rules: Rule[];
  items: PriceItem[];
  settings: Settings;
  disclaimer: string;
};

const TTL_MS = Number(process.env["CMS_CACHE_SECONDS"] ?? 60) * 1000;
let cache: { at: number; data: Data } | undefined;
const EMPTY: Data = {
  scenarios: [],
  rules: [],
  items: [],
  settings: { rangePercent: 15, fixedExtra: 0, conditionCoefficients: {} },
  disclaimer: "",
};

async function directus<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env["DIRECTUS_URL"]}${path}`, {
    headers: { authorization: `Bearer ${process.env["DIRECTUS_TOKEN"]}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`CMS ${path} -> ${res.status}`);
  return ((await res.json()) as { data: T }).data;
}

// Directus отдаёт числа типа decimal строками — приводим к числу.
const num = (v: unknown, d = 0): number => {
  const n = Number(v);
  return v === null || v === undefined || v === "" || !Number.isFinite(n) ? d : n;
};

async function load(): Promise<Data> {
  if (!process.env["DIRECTUS_URL"] || !process.env["DIRECTUS_TOKEN"]) return EMPTY;
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  try {
    const [sc, qs, os, rs, ps, st] = await Promise.all([
      directus<any[]>(
        `/items/calc_scenarios?filter[is_active][_eq]=true&sort=sort&limit=-1&fields=id,title,description,object_type.coefficient,object_type.is_active`,
      ),
      directus<any[]>(
        `/items/calc_questions?sort=sort&limit=-1&fields=id,scenario,text,kind,unit,is_required,show_if_option`,
      ),
      directus<any[]>(
        `/items/calc_options?sort=sort&limit=-1&fields=id,question,label,value_number`,
      ),
      directus<any[]>(
        `/items/calc_rules?limit=-1&fields=option,question,price_item,formula,multiplier,step`,
      ),
      directus<any[]>(`/items/calc_price_items?limit=-1&fields=id,title,price`),
      directus<any>(`/items/calc_settings`),
    ]);
    const scenarios: Scenario[] = sc
      .filter((s) => s.object_type?.is_active !== false)
      .map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description ?? "",
        coefficient: num(s.object_type?.coefficient, 1),
        questions: qs
          .filter((q) => q.scenario === s.id)
          .map((q) => ({
            id: q.id,
            text: q.text,
            kind: q.kind ?? "single",
            unit: q.unit ?? null,
            required: q.is_required !== false,
            showIfOption: q.show_if_option ?? null,
            options: os
              .filter((o) => o.question === q.id)
              .map((o) => ({
                id: o.id,
                label: o.label,
                valueNumber: o.value_number === null ? null : num(o.value_number),
              })),
          })),
      }));
    const data: Data = {
      scenarios,
      rules: rs.map((r) => ({
        optionId: r.option ?? null,
        questionId: r.question ?? null,
        priceItemId: r.price_item,
        formula: r.formula ?? "fixed",
        multiplier: num(r.multiplier, 1),
        step: r.step === null || r.step === undefined ? null : num(r.step),
      })),
      items: ps.map((p) => ({ id: p.id, title: p.title, price: num(p.price) })),
      settings: {
        rangePercent: num(st?.range_percent, 15),
        fixedExtra: num(st?.fixed_extra),
        conditionCoefficients:
          st?.condition_coefficients && typeof st.condition_coefficients === "object"
            ? Object.fromEntries(
                Object.entries(st.condition_coefficients as Record<string, unknown>).map(
                  ([k, v]) => [k, num(v, 1)],
                ),
              )
            : {},
      },
      disclaimer: st?.disclaimer ?? "",
    };
    cache = { at: Date.now(), data };
    return data;
  } catch (error) {
    console.error("CMS (калькулятор) недоступна:", error);
    return cache?.data ?? EMPTY;
  }
}

const DEFAULT_DISCLAIMER =
  "Расчёт предварительный и не является офертой. Итоговая стоимость определяется после обследования объекта и согласования состава работ.";

/** Структура опроса. Цены и правила расчёта наружу не отдаются. */
export const getCalculator = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ready: boolean; scenarios: Scenario[]; disclaimer: string }> => {
    const d = await load();
    const ready = d.scenarios.length > 0 && d.rules.length > 0 && d.items.some((i) => i.price > 0);
    return {
      ready,
      scenarios: ready ? d.scenarios : [],
      disclaimer: d.disclaimer || DEFAULT_DISCLAIMER,
    };
  },
);

function cleanAnswers(input: unknown): Answers {
  const out: Answers = {};
  if (!input || typeof input !== "object") return out;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const id = Number(k);
    if (!Number.isInteger(id)) continue;
    if (typeof v === "boolean") out[id] = v;
    else if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1_000_000) out[id] = v;
    else if (Array.isArray(v))
      out[id] = v.filter((x): x is number => Number.isInteger(x)).slice(0, 50);
  }
  return out;
}

export const calculateEstimate = createServerFn({ method: "POST" })
  .inputValidator((v: { scenarioId: number; answers: Record<string, unknown> }) => ({
    scenarioId: Number(v?.scenarioId),
    answers: cleanAnswers(v?.answers),
  }))
  .handler(async ({ data }): Promise<CalcResult> => {
    const d = await load();
    const scenario = d.scenarios.find((s) => s.id === data.scenarioId);
    if (!scenario) return { ok: false, reason: "no_prices" };
    const r = calculate(scenario, data.answers, d.rules, d.items, d.settings);
    // Разбивку по позициям наружу не отдаём: показываем только диапазон
    return r.ok ? { ...r, lines: [] } : r;
  });
