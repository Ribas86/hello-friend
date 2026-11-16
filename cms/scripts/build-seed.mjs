// Собирает cms/seed/data.json: прежние услуги сайта (data.base.json) + перечень работ компании (perechen-uslug.txt),
// сгруппированные по шести направлениям из ТЗ. Запускается вручную: node cms/scripts/build-seed.mjs
import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL("../seed/", import.meta.url);
const base = JSON.parse(readFileSync(new URL("data.base.json", dir)));
const text = readFileSync(new URL("perechen-uslug.txt", dir), "utf8").split(/\r?\n/);

// --- разбор перечня: раздел -> { номер пункта -> текст }
const sectionTitles = [
  "Видеонаблюдение (СВН)",
  "Автоматические шлагбаумы и управление въездом",
  "Системы контроля и управления доступом (СКУД)",
  "Комплексные системы безопасности",
  "Техническое обслуживание и сервис",
  "Дополнительные работы",
];
const S = {};
let cur = 0;
for (const raw of text) {
  const line = raw.trim();
  const m = line.match(/^(\d+)\.\s+(.+)$/);
  if (!m) continue;
  const n = Number(m[1]);
  const t = m[2];
  const si = sectionTitles.indexOf(t);
  if (si !== -1 && n === si + 1) {
    cur = n;
    S[cur] = {};
    continue;
  }
  if (cur) S[cur][n] = t.replace(/\.$/, "");
}
const counts = [25, 15, 13, 8, 15, 10];
counts.forEach((c, i) => {
  if (Object.keys(S[i + 1] ?? {}).length !== c)
    throw new Error(`Раздел ${i + 1}: ${Object.keys(S[i + 1] ?? {}).length} пунктов вместо ${c}`);
});
const pick = (sec, nums) =>
  nums.map(
    (n) =>
      S[sec][n] ??
      (() => {
        throw new Error(`нет пункта ${sec}.${n}`);
      })(),
  );

// --- направления (названия из ТЗ и перечня; описания — черновик для правки в CMS)
const directions = [
  {
    slug: "videonablyudenie",
    title: "Видеонаблюдение",
    short: "Проектирование, монтаж, настройка и сопровождение систем видеонаблюдения.",
  },
  {
    slug: "skud",
    title: "СКУД — системы контроля и управления доступом",
    short: "Проектирование, установка и настройка систем контроля и управления доступом.",
  },
  {
    slug: "shlagbaumy",
    title: "Автоматические шлагбаумы и управление въездом",
    short: "Монтаж автоматических шлагбаумов и организация управления въездом.",
  },
  {
    slug: "kompleksnye-sistemy",
    title: "Комплексные системы безопасности",
    short: "Объединение видеонаблюдения, СКУД и управления въездом в единую систему.",
  },
  {
    slug: "obsluzhivanie",
    title: "Техническое обслуживание и сервис",
    short: "Плановое обслуживание, диагностика и ремонт систем безопасности.",
  },
  {
    slug: "dopolnitelnye",
    title: "Дополнительные работы",
    short: "Обследование объектов, аудит, демонтаж, перенос оборудования и документация.",
  },
].map((d, i) => ({ ...d, description: d.short, sort: i + 1 }));

// --- прежние услуги: направление и пункты перечня, которые дописываются в «Состав работ»
const existing = {
  proektirovanie: ["videonablyudenie", 1, [23, 24]],
  "podbor-oborudovaniya": ["videonablyudenie", 6, [3]],
  "postavka-oborudovaniya": ["videonablyudenie", 1, [25]],
  montazh: ["videonablyudenie", 1, [6, 7, 8, 9, 10]],
  "kabelnye-trassy": ["videonablyudenie", 1, [1, 2, 11, 12, 13, 14, 15]],
  "ustanovka-kamer": ["videonablyudenie", 1, [3, 16]],
  registratory: ["videonablyudenie", 1, [4, 5, 18]],
  "servery-arhiv": ["videonablyudenie", 1, []],
  "udalennyj-dostup": ["videonablyudenie", 1, []],
  puskonaladka: ["videonablyudenie", 1, [17, 19, 20, 21, 22]],
  tehobsluzhivanie: ["obsluzhivanie", 5, [1, 2, 3, 5, 6, 7, 8, 9, 10, 14, 15]],
  diagnostika: ["obsluzhivanie", 5, [4]],
  remont: ["obsluzhivanie", 5, [11, 12]],
  modernizaciya: ["obsluzhivanie", 5, [13]],
  integraciya: ["kompleksnye-sistemy", 4, []],
  obsledovanie: ["dopolnitelnye", 6, [1, 2, 4]],
};
// "podbor-oborudovaniya": пункт 3 раздела 6 «Подбор оборудования» — отдельная запись, см. ниже
existing["podbor-oborudovaniya"] = ["videonablyudenie", 6, [3]];
const added = {};
const services = base.services.map((s) => {
  const [direction, sec, nums] = existing[s.slug];
  const have = new Set(s.works.map((w) => w.toLowerCase()));
  const extra = pick(sec, nums).filter((w) => !have.has(w.toLowerCase()));
  added[s.slug] = extra.length;
  return { ...s, direction, works: [...s.works, ...extra] };
});

// --- новые услуги для направлений, которых на сайте не было (черновик текстов; пункты — из перечня)
const mk = (direction, slug, title, short, works) => ({
  slug,
  title,
  short,
  description: short,
  audience: "",
  steps: [],
  works,
  faq: [],
  related: [],
  direction,
});
const fresh = [
  mk(
    "shlagbaumy",
    "shlagbaumy",
    "Монтаж автоматических шлагбаумов",
    "Подготовка основания, монтаж и подключение автоматических шлагбаумов и сопутствующего оборудования.",
    pick(
      2,
      [...Array(15)].map((_, i) => i + 1),
    ),
  ),
  mk(
    "skud",
    "skud-proektirovanie",
    "Проектирование СКУД",
    "Проектирование систем контроля и управления доступом под задачи объекта.",
    pick(3, [1]),
  ),
  mk(
    "skud",
    "skud-montazh",
    "Монтаж и установка СКУД",
    "Установка контроллеров, считывателей, замков и проходных устройств, прокладка кабельных линий.",
    pick(3, [2, 3, 4, 5, 6, 7, 8]),
  ),
  mk(
    "skud",
    "skud-nastrojka",
    "Настройка и интеграция СКУД",
    "Настройка программного обеспечения, прав доступа, интеграция с видеонаблюдением, пусконаладка.",
    pick(3, [9, 10, 11, 12]),
  ),
  mk(
    "skud",
    "skud-obsluzhivanie",
    "Обслуживание и ремонт СКУД",
    "Техническое обслуживание и ремонт систем контроля и управления доступом.",
    pick(3, [13]),
  ),
  mk(
    "kompleksnye-sistemy",
    "ksb-proektirovanie",
    "Проектирование и интеграция комплексных систем",
    "Разработка комплексных решений и объединение подсистем безопасности в единую систему управления.",
    pick(4, [1, 2, 3, 4, 5]),
  ),
  mk(
    "kompleksnye-sistemy",
    "ksb-obsluzhivanie",
    "Модернизация и обслуживание комплексных систем",
    "Модернизация существующих систем безопасности, диагностика и техническое обслуживание.",
    pick(4, [6, 7, 8]),
  ),
  mk(
    "dopolnitelnye",
    "demontazh-perenos",
    "Демонтаж, перенос и переустановка оборудования",
    "Демонтаж устаревшего оборудования, перенос и переустановка, замена кабельных линий.",
    pick(6, [5, 6, 7]),
  ),
  mk(
    "dopolnitelnye",
    "rasshirenie-obuchenie",
    "Расширение систем, обучение и документация",
    "Расширение существующих систем, обучение персонала заказчика, подготовка технической и исполнительной документации.",
    pick(6, [8, 9, 10]),
  ),
];
// все 121 пункта перечня должны попасть в услуги (с учётом пересечений)
const used = new Set([
  ...Object.values(existing).flatMap(([, sec, n]) => n.map((x) => `${sec}.${x}`)),
  ...[
    [2, 15],
    [3, 13],
    [4, 8],
    [6, 10],
  ].flatMap(([sec, c]) => [...Array(c)].map((_, i) => `${sec}.${i + 1}`)),
]);
const missing = [];
counts.forEach((c, i) => {
  for (let n = 1; n <= c; n++) if (!used.has(`${i + 1}.${n}`)) missing.push(`${i + 1}.${n}`);
});
console.log("Пункты перечня, не попавшие в услуги:", missing.join(", ") || "нет");
console.log("Дописано пунктов в прежние услуги:", JSON.stringify(added));
writeFileSync(
  new URL("data.json", dir),
  JSON.stringify(
    { company: base.company, directions, services: [...services, ...fresh], faq: base.faq },
    null,
    2,
  ),
);
console.log("услуг:", services.length + fresh.length, "направлений:", directions.length);
