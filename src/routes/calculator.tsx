import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import { PageHero, Section, seo, ContactNotice } from "@/components/site/blocks";
import { calculateEstimate, getCalculator } from "@/lib/calc.functions";
import { visibleQuestions, type Answers, type CalcResult, type Question } from "@/lib/calc-engine";

export const Route = createFileRoute("/calculator")({
  loader: () => getCalculator(),
  head: () =>
    seo(
      "Расчёт стоимости",
      "Предварительный расчёт стоимости систем безопасности: ответьте на несколько вопросов об объекте.",
      { geo: true },
    ),
  component: Page,
});

const rub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;

function Page() {
  const { ready, scenarios, disclaimer } = Route.useLoaderData();
  const [scenarioId, setScenarioId] = useState<number | null>(
    scenarios.length === 1 ? (scenarios[0]?.id ?? null) : null,
  );
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [busy, setBusy] = useState(false);

  const scenario = scenarios.find((s) => s.id === scenarioId);
  const questions = scenario ? visibleQuestions(scenario, answers) : [];
  const q = questions[step];
  const last = step >= questions.length - 1;

  const reset = () => {
    setAnswers({});
    setStep(0);
    setResult(null);
    if (scenarios.length > 1) setScenarioId(null);
  };
  const set = (id: number, v: Answers[number]) => setAnswers((a) => ({ ...a, [id]: v }));
  const answered = (x: Question) => {
    const a = answers[x.id];
    return x.kind === "number"
      ? typeof a === "number"
      : x.kind === "yesno"
        ? typeof a === "boolean"
        : x.kind === "multi"
          ? Array.isArray(a) && a.length > 0
          : typeof a === "number";
  };
  const canNext = q ? !q.required || answered(q) : false;

  const finish = async () => {
    if (!scenario) return;
    setBusy(true);
    try {
      setResult(await calculateEstimate({ data: { scenarioId: scenario.id, answers } }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Калькулятор"
        title="Расчёт стоимости"
        lead="Ответьте на несколько вопросов об объекте. Расчёт предварительный: регистрация и отправка данных не нужны."
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          {!ready ? (
            <div className="flex gap-3 rounded-xl border bg-card p-6 text-sm shadow-card">
              <Info className="h-5 w-5 shrink-0 text-primary" />
              <p>
                Цены на оборудование и работы ещё не внесены компанией, поэтому автоматический
                расчёт пока недоступен. Как только цены будут внесены, расчёт появится здесь
                автоматически.
              </p>
            </div>
          ) : result?.ok ? (
            <div className="surface-ink rounded-2xl p-8 sm:p-10">
              <p className="eyebrow">Предварительная стоимость</p>
              <p className="mt-4 font-display text-3xl sm:text-4xl">
                от {rub(result.min)} до {rub(result.max)}
              </p>
              <p className="mt-6 text-sm text-ink-muted">{disclaimer}</p>
              <button className="btn btn-ghost-ink glass-btn-lg mt-8" onClick={reset}>
                Рассчитать заново
              </button>
            </div>
          ) : result ? (
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <p>
                Для этого сочетания ответов расчёт сделать не удалось. Попробуйте изменить ответы.
              </p>
              <button className="btn btn-outline mt-4" onClick={reset}>
                Начать заново
              </button>
            </div>
          ) : !scenario ? (
            <div>
              <h2 className="font-sans text-xl font-semibold">Что нужно рассчитать?</h2>
              <div className="mt-5 grid gap-3">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScenarioId(s.id)}
                    className="rounded-xl border bg-card p-5 text-left shadow-card transition hover:border-primary"
                  >
                    <span className="font-semibold">{s.title}</span>
                    {s.description && (
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {s.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : q ? (
            <div>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Шаг {step + 1} из {questions.length}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <h2 className="font-sans text-xl font-semibold">{q.text}</h2>
              <div className="mt-5 grid gap-3">
                {q.kind === "number" && (
                  <div className="flex items-center gap-3">
                    <input
                      className="field max-w-48"
                      inputMode="numeric"
                      maxLength={7}
                      value={typeof answers[q.id] === "number" ? String(answers[q.id]) : ""}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "");
                        setAnswers((a) => {
                          const next = { ...a };
                          if (d === "") delete next[q.id];
                          else next[q.id] = Number(d);
                          return next;
                        });
                      }}
                    />
                    {q.unit && <span className="text-muted-foreground">{q.unit}</span>}
                  </div>
                )}
                {q.kind === "yesno" &&
                  [true, false].map((v) => (
                    <Choice key={String(v)} on={answers[q.id] === v} onClick={() => set(q.id, v)}>
                      {v ? "Да" : "Нет"}
                    </Choice>
                  ))}
                {q.kind === "single" &&
                  q.options.map((o) => (
                    <Choice key={o.id} on={answers[q.id] === o.id} onClick={() => set(q.id, o.id)}>
                      {o.label}
                    </Choice>
                  ))}
                {q.kind === "multi" &&
                  q.options.map((o) => {
                    const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as number[]) : [];
                    const on = cur.includes(o.id);
                    return (
                      <Choice
                        key={o.id}
                        on={on}
                        onClick={() =>
                          set(q.id, on ? cur.filter((x) => x !== o.id) : [...cur, o.id])
                        }
                      >
                        {o.label}
                      </Choice>
                    );
                  })}
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  className="btn btn-outline"
                  disabled={step === 0 && scenarios.length <= 1}
                  onClick={() => (step === 0 ? reset() : setStep(step - 1))}
                >
                  <ArrowLeft className="h-4 w-4" /> Назад
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!canNext || busy}
                  onClick={() => (last ? finish() : setStep(step + 1))}
                >
                  {last ? "Рассчитать" : "Далее"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <p>В этом расчёте пока нет вопросов.</p>
          )}
        </div>
      </Section>
      <Section id="contacts" eyebrow="Контакты" title="Связаться с нами">
        <div className="max-w-3xl">
          <ContactNotice withCalculator={false} />
        </div>
      </Section>
    </>
  );
}

function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left transition ${on ? "border-primary bg-primary/10" : "bg-card hover:border-primary"}`}
    >
      {children}
      {on && <Check className="h-5 w-5 text-primary" />}
    </button>
  );
}
