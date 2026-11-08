// Загружает в CMS услуги, вопросы и данные компании из seed/data.json. Повторный запуск не дублирует записи.
import { readFileSync } from "node:fs";
import { login, api } from "./lib.mjs";
const data = JSON.parse(readFileSync(new URL("../seed/data.json", import.meta.url)));
await login();

const groups = [
  [
    "proektirovanie-i-postavka",
    "Проектирование и поставка",
    ["proektirovanie", "obsledovanie", "podbor-oborudovaniya", "postavka-oborudovaniya"],
  ],
  [
    "montazh-i-nastrojka",
    "Монтаж и настройка",
    [
      "montazh",
      "kabelnye-trassy",
      "ustanovka-kamer",
      "registratory",
      "servery-arhiv",
      "udalennyj-dostup",
      "puskonaladka",
    ],
  ],
  [
    "obsluzhivanie-i-razvitie",
    "Обслуживание и развитие",
    ["tehobsluzhivanie", "diagnostika", "remont", "modernizaciya", "integraciya"],
  ],
];
const upsert = async (collection, key, row) => {
  const found = (
    await api(
      "GET",
      `/items/${collection}?filter[${key}][_eq]=${encodeURIComponent(row[key])}&limit=1`,
    )
  ).data[0];
  if (found) {
    await api("PATCH", `/items/${collection}/${found.id}`, row);
    return found.id;
  }
  return (await api("POST", `/items/${collection}`, row)).data.id;
};

for (const [i, [slug, title]] of [
  ["business", "Бизнес"],
  ["home", "Частные лица"],
].entries())
  await upsert("audiences", "slug", { slug, title, sort: i + 1 });
const catId = {};
for (const [i, [slug, title, members]] of groups.entries()) {
  const id = await upsert("categories", "slug", { slug, title, sort: i + 1 });
  members.forEach((m) => (catId[m] = id));
}

const ids = {};
for (const [i, s] of data.services.entries()) {
  ids[s.slug] = await upsert("services", "slug", {
    status: "published",
    sort: i + 1,
    slug: s.slug,
    title: s.title,
    short: s.short,
    description: s.description,
    audience_text: s.audience,
    steps: s.steps.map((title) => ({ title })),
    works: s.works.map((title) => ({ title })),
    category: catId[s.slug] ?? null,
  });
}
// «похожие услуги» и вопросы пересоздаются целиком, чтобы повторный запуск не плодил дубли
const oldRel = (await api("GET", "/items/services_related?limit=-1&fields=id")).data.map(
  (x) => x.id,
);
if (oldRel.length) await api("DELETE", "/items/services_related", oldRel);
await api(
  "POST",
  "/items/services_related",
  data.services.flatMap((s) =>
    s.related.map((r) => ({ services_id: ids[s.slug], related_services_id: ids[r] })),
  ),
);
const oldFaq = (await api("GET", "/items/service_faq?limit=-1&fields=id")).data.map((x) => x.id);
if (oldFaq.length) await api("DELETE", "/items/service_faq", oldFaq);
await api("POST", "/items/service_faq", [
  ...data.services.flatMap((s) =>
    s.faq.map((f, i) => ({
      status: "published",
      sort: i + 1,
      question: f.q,
      answer: f.a,
      service: ids[s.slug],
    })),
  ),
  ...data.faq.map((f, i) => ({
    status: "published",
    sort: i + 1,
    question: f.q,
    answer: f.a,
    service: null,
  })),
]);
await api("PATCH", "/items/site_settings", {
  company_name: data.company.name,
  short_name: data.company.short,
  years: data.company.years,
});
await api("PATCH", "/items/calc_settings", {
  range_percent: 15,
  disclaimer:
    "Расчёт предварительный и не является публичной офертой. Точная стоимость определяется после обследования объекта.",
});
console.log("услуг:", Object.keys(ids).length);
