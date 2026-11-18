import { describe, expect, it } from "vitest";
import { calculate, visibleQuestions, type Rule, type Scenario } from "./calc-engine";

// Золотые тесты: ожидаемые суммы посчитаны вручную, не программой.
const opt = (id: number, label: string, valueNumber: number | null = null) => ({
  id,
  label,
  valueNumber,
});
const scenario: Scenario = {
  id: 1,
  title: "Склад",
  description: "",
  coefficient: 1.2,
  questions: [
    {
      id: 1,
      text: "Тип системы",
      kind: "single",
      unit: null,
      required: true,
      showIfOption: null,
      options: [opt(11, "IP"), opt(12, "Аналоговая")],
    },
    {
      id: 2,
      text: "Камер",
      kind: "number",
      unit: "шт.",
      required: true,
      showIfOption: null,
      options: [],
    },
    {
      id: 3,
      text: "Площадь",
      kind: "number",
      unit: "м²",
      required: true,
      showIfOption: null,
      options: [],
    },
    {
      id: 4,
      text: "Монтаж",
      kind: "yesno",
      unit: null,
      required: true,
      showIfOption: null,
      options: [],
    },
    {
      id: 5,
      text: "Дополнительно",
      kind: "multi",
      unit: null,
      required: false,
      showIfOption: null,
      options: [opt(51, "Архив"), opt(52, "Смартфон")],
    },
    {
      id: 6,
      text: "Каналов регистратора",
      kind: "number",
      unit: "шт.",
      required: true,
      showIfOption: 11,
      options: [],
    },
  ],
};
const items = [
  { id: 1, title: "Комплект IP", price: 10000 },
  { id: 2, title: "Комплект аналог", price: 6000 },
  { id: 3, title: "Камера", price: 4000 },
  { id: 4, title: "Площадь (шаг)", price: 2500 },
  { id: 5, title: "Монтаж", price: 8000 },
  { id: 6, title: "Архив", price: 3000 },
  { id: 7, title: "Смартфон", price: 1000 },
  { id: 8, title: "Канал", price: 700 },
];
const rules: Rule[] = [
  { optionId: 11, questionId: null, priceItemId: 1, formula: "fixed", multiplier: 1, step: null },
  { optionId: 12, questionId: null, priceItemId: 2, formula: "fixed", multiplier: 1, step: null },
  { optionId: null, questionId: 2, priceItemId: 3, formula: "per_unit", multiplier: 1, step: null },
  {
    optionId: null,
    questionId: 3,
    priceItemId: 4,
    formula: "per_area_step",
    multiplier: 1,
    step: 100,
  },
  { optionId: null, questionId: 4, priceItemId: 5, formula: "yes_no", multiplier: 1, step: null },
  { optionId: 51, questionId: null, priceItemId: 6, formula: "fixed", multiplier: 1, step: null },
  { optionId: 52, questionId: null, priceItemId: 7, formula: "fixed", multiplier: 1, step: null },
  { optionId: null, questionId: 6, priceItemId: 8, formula: "per_unit", multiplier: 1, step: null },
];
const settings = { rangePercent: 15, fixedExtra: 2000, conditionCoefficients: { "51": 1.1 } };

describe("калькулятор: золотые примеры", () => {
  it("IP, 8 камер, 250 м², монтаж, архив, 4 канала", () => {
    // позиции: 10000 + 8×4000 + ⌈250/100⌉×2500 + 8000 + 3000 + 4×700 = 63300
    // ×1,2 = 75960; ×1,1 (архив) = 83556; +2000 = 85556
    // min = 85556×0,85 = 72722,6 → 72700; max = 85556×1,15 = 98389,4 → 98400
    const r = calculate(
      scenario,
      { 1: 11, 2: 8, 3: 250, 4: true, 5: [51], 6: 4 },
      rules,
      items,
      settings,
    );
    expect(r).toMatchObject({ ok: true, total: 85556, min: 72700, max: 98400 });
  });

  it("аналоговая, 4 камеры, 100 м², без монтажа; скрытый вопрос не учитывается", () => {
    // позиции: 6000 + 4×4000 + 1×2500 = 24500; ×1,2 = 29400; +2000 = 31400
    // min = 26690 → 26600; max = 36110 → 36200
    const r = calculate(scenario, { 1: 12, 2: 4, 3: 100, 4: false, 6: 9 }, rules, items, settings);
    expect(r).toMatchObject({ ok: true, total: 31400, min: 26600, max: 36200 });
  });

  it("не хватает обязательных ответов", () => {
    const r = calculate(scenario, { 1: 11, 3: 100, 4: true }, rules, items, settings);
    expect(r).toEqual({ ok: false, reason: "missing", missing: [2, 6] });
  });

  it("цен нет — расчёта нет", () => {
    const r = calculate(scenario, { 1: 11, 2: 1, 3: 1, 4: true, 6: 1 }, [], [], settings);
    expect(r).toEqual({ ok: false, reason: "no_prices" });
  });

  it("показ вопросов зависит от выбранного варианта", () => {
    expect(visibleQuestions(scenario, { 1: 12 }).map((q) => q.id)).toEqual([1, 2, 3, 4, 5]);
    expect(visibleQuestions(scenario, { 1: 11 }).map((q) => q.id)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("вариант с числовым значением умножается на цену", () => {
    const s: Scenario = {
      ...scenario,
      coefficient: 1,
      questions: [
        {
          id: 1,
          text: "Размер",
          kind: "single",
          unit: null,
          required: true,
          showIfOption: null,
          options: [opt(11, "4 камеры", 4)],
        },
      ],
    };
    const r = calculate(
      s,
      { 1: 11 },
      [
        {
          optionId: 11,
          questionId: null,
          priceItemId: 3,
          formula: "per_unit",
          multiplier: 1,
          step: null,
        },
      ],
      items,
      { rangePercent: 10, fixedExtra: 0, conditionCoefficients: {} },
    );
    // 4 × 4000 = 16000; min = 14400; max = 17600
    expect(r).toMatchObject({ ok: true, total: 16000, min: 14400, max: 17600 });
  });
});
