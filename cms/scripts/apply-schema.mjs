// Создаёт коллекции, поля и связи. Повторный запуск безопасен (существующее пропускается).
import { login, api } from "./lib.mjs";

const T = {
  // типы полей
  str: { type: "string" },
  text: { type: "text" },
  int: { type: "integer" },
  dec: { type: "decimal", schema: { numeric_precision: 12, numeric_scale: 2 } },
  bool: { type: "boolean" },
  json: { type: "json" },
  ts: { type: "timestamp" },
};
const f = (field, t, meta = {}, schema = {}) => ({
  field,
  ...T[t],
  meta,
  schema: { ...(T[t].schema ?? {}), ...schema },
});
const required = { required: true };
const sort = f("sort", "int", { hidden: true });
const status = f(
  "status",
  "str",
  {
    interface: "select-dropdown",
    width: "half",
    options: {
      choices: [
        { text: "Черновик", value: "draft" },
        { text: "Опубликовано", value: "published" },
      ],
    },
  },
  { default_value: "draft", is_nullable: false },
);
const slug = (note) =>
  f("slug", "str", { ...required, note, width: "half" }, { is_unique: true, is_nullable: false });
const seo = [
  f("seo_title", "str", { note: "Заголовок для поисковиков (до ~60 знаков)" }),
  f("seo_description", "text", { note: "Описание для поисковиков (до ~160 знаков)" }),
];
const m2o = (field, related, meta = {}) => ({
  field,
  type: "integer",
  meta: { interface: "select-dropdown-m2o", ...meta },
  schema: {},
  _rel: related,
});

const collections = {
  audiences: {
    note: "Для кого услуга (бизнес / частные лица)",
    fields: [slug(), f("title", "str", required), sort],
  },
  categories: {
    note: "Категории услуг",
    fields: [slug(), f("title", "str", required), f("description", "text"), sort],
  },
  services: {
    note: "Услуги",
    sortField: "sort",
    fields: [
      status,
      sort,
      slug("Латиницей, без пробелов: попадёт в адрес страницы"),
      f("title", "str", required),
      f("short", "text", { note: "Короткое описание для карточки" }),
      f("description", "text", { interface: "input-multiline" }),
      f("audience_text", "text", { note: "Кому подходит" }),
      f("steps", "json", {
        interface: "list",
        note: "Этапы работ",
        options: {
          template: "{{ . }}",
          fields: [
            {
              field: "title",
              type: "string",
              name: "Этап",
              meta: { interface: "input", width: "full" },
            },
          ],
        },
      }),
      f("works", "json", {
        interface: "list",
        note: "Состав работ",
        options: {
          fields: [
            {
              field: "title",
              type: "string",
              name: "Работа",
              meta: { interface: "input", width: "full" },
            },
          ],
        },
      }),
      m2o("audience", "audiences"),
      m2o("category", "categories"),
      ...seo,
    ],
  },
  service_faq: {
    note: "Вопросы и ответы. Без услуги — общий FAQ сайта",
    sortField: "sort",
    fields: [
      status,
      sort,
      f("question", "str", required),
      f("answer", "text", required),
      m2o("service", "services", { note: "Пусто = общий вопрос сайта" }),
    ],
  },
  article_topics: { note: "Темы статей", fields: [slug(), f("title", "str", required), sort] },
  articles: {
    note: "Статьи",
    fields: [
      status,
      slug(),
      f("title", "str", required),
      f("summary", "text"),
      f("body", "text", { interface: "input-rich-text-html" }),
      f("published_at", "ts"),
      m2o("topic", "article_topics"),
      {
        field: "cover",
        type: "uuid",
        meta: { interface: "file-image" },
        schema: {},
        _rel: "directus_files",
      },
      ...seo,
    ],
  },
  pages: {
    note: "Страницы («О компании», политика и др.)",
    fields: [
      status,
      slug(),
      f("title", "str", required),
      f("body", "text", { interface: "input-rich-text-html" }),
      ...seo,
    ],
  },
  site_settings: {
    note: "Данные компании и контакты",
    singleton: true,
    fields: [
      f("company_name", "str"),
      f("short_name", "str"),
      f("years", "int", { note: "Лет на рынке" }),
      f("phone", "str"),
      f("email", "str"),
      f("address", "text"),
      f("messenger", "str", { note: "Ссылка на мессенджер" }),
      f("work_hours", "str"),
      f("requisites", "text", { note: "Реквизиты для PDF и страницы контактов" }),
      {
        field: "logo",
        type: "uuid",
        meta: { interface: "file-image" },
        schema: {},
        _rel: "directus_files",
      },
    ],
  },
  redirects: {
    note: "Перенаправления старых адресов",
    fields: [
      f("from_path", "str", required, { is_unique: true }),
      f("to_path", "str", required),
      f("status_code", "int", { width: "half" }, { default_value: 301 }),
      f("is_active", "bool", { width: "half" }, { default_value: true }),
    ],
  },
  // --- калькулятор (структура; наполнение и расчёт — Релиз 3) ---
  calc_object_types: {
    note: "Калькулятор: типы объектов (коэффициент объекта)",
    fields: [
      f("title", "str", required),
      slug(),
      f("coefficient", "dec", { note: "Коэффициент объекта K_obj" }, { default_value: 1 }),
      f("is_active", "bool", {}, { default_value: true }),
      sort,
    ],
  },
  calc_scenarios: {
    note: "Калькулятор: сценарии",
    fields: [
      f("title", "str", required),
      slug(),
      f("description", "text"),
      m2o("object_type", "calc_object_types"),
      f("is_active", "bool", {}, { default_value: true }),
      sort,
    ],
  },
  calc_questions: {
    note: "Калькулятор: вопросы шагов",
    fields: [
      m2o("scenario", "calc_scenarios"),
      f("text", "str", required),
      f(
        "kind",
        "str",
        {
          interface: "select-dropdown",
          options: {
            choices: [
              { text: "Один вариант", value: "single" },
              { text: "Несколько вариантов", value: "multi" },
              { text: "Число", value: "number" },
              { text: "Да / нет", value: "yesno" },
            ],
          },
        },
        { default_value: "single" },
      ),
      f("unit", "str", { note: "Единица для числового вопроса" }),
      f("is_required", "bool", {}, { default_value: true }),
      m2o("show_if_option", "calc_options", {
        note: "Показывать, только если выбран этот вариант",
      }),
      sort,
    ],
  },
  calc_options: {
    note: "Калькулятор: варианты ответов",
    fields: [
      m2o("question", "calc_questions"),
      f("label", "str", required),
      f("value_number", "dec", { note: "Числовое значение (если нужно)" }),
      sort,
    ],
  },
  calc_price_items: {
    note: "Калькулятор: позиции прайса",
    fields: [
      f("title", "str", required),
      f("unit", "str", { note: "шт., м, м², услуга" }),
      f("price", "dec", required),
      f("note", "text"),
    ],
  },
  calc_rules: {
    note: "Калькулятор: правила расчёта (какой ответ добавляет какую цену)",
    fields: [
      m2o("option", "calc_options"),
      m2o("question", "calc_questions"),
      m2o("price_item", "calc_price_items"),
      f(
        "formula",
        "str",
        {
          interface: "select-dropdown",
          options: {
            choices: [
              { text: "Фиксированная сумма", value: "fixed" },
              { text: "За единицу × количество", value: "per_unit" },
              { text: "За шаг площади", value: "per_area_step" },
              { text: "Да / нет", value: "yes_no" },
            ],
          },
        },
        { default_value: "fixed" },
      ),
      f("multiplier", "dec", {}, { default_value: 1 }),
      f("step", "dec", { note: "Размер шага (для площади)" }),
    ],
  },
  calc_settings: {
    note: "Калькулятор: общие настройки",
    singleton: true,
    fields: [
      f(
        "range_percent",
        "dec",
        { note: "Разброс диапазона, % (например 15)" },
        { default_value: 15 },
      ),
      f("disclaimer", "text", { note: "Оговорка: расчёт предварительный, не оферта" }),
      f(
        "fixed_extra",
        "dec",
        { note: "Постоянная добавка D (выезд, доставка)" },
        { default_value: 0 },
      ),
      f("condition_coefficients", "json", { note: "Коэффициенты условий K_cond" }),
    ],
  },
};

const rels = [];
await login();
const existing = new Set((await api("GET", "/collections?limit=-1")).data.map((c) => c.collection));
for (const [name, c] of Object.entries(collections)) {
  const fields = c.fields.map(({ _rel, ...rest }) => rest);
  c.fields.forEach((fl) => fl._rel && rels.push({ many: name, field: fl.field, one: fl._rel }));
  if (existing.has(name)) {
    console.log("есть", name);
    continue;
  }
  await api("POST", "/collections", {
    collection: name,
    meta: {
      note: c.note,
      singleton: !!c.singleton,
      sort_field: c.sortField ?? null,
      icon: undefined,
    },
    schema: {},
    fields: [
      {
        field: "id",
        type: "integer",
        meta: { hidden: true, readonly: true, interface: "input" },
        schema: { is_primary_key: true, has_auto_increment: true },
      },
      ...fields,
    ],
  });
  console.log("создана", name);
}
for (const r of rels) {
  await api(
    "POST",
    "/relations",
    {
      collection: r.many,
      field: r.field,
      related_collection: r.one,
      schema: { on_delete: "SET NULL" },
    },
    { allow: [400, 403] },
  )
    .then((x) => console.log("связь", r.many, "→", r.one))
    .catch((e) => console.log("связь пропущена", r.many, r.field, String(e).slice(0, 90)));
}
// связь «похожие услуги» (many-to-many через соединительную таблицу)
if (!existing.has("services_related")) {
  await api("POST", "/collections", {
    collection: "services_related",
    meta: { hidden: true, icon: "import_export", note: "Похожие услуги (связь)" },
    schema: {},
    fields: [
      {
        field: "id",
        type: "integer",
        schema: { is_primary_key: true, has_auto_increment: true },
        meta: { hidden: true },
      },
      { field: "services_id", type: "integer", schema: {}, meta: { hidden: true } },
      { field: "related_services_id", type: "integer", schema: {}, meta: { hidden: true } },
    ],
  });
  await api("POST", "/relations", {
    collection: "services_related",
    field: "services_id",
    related_collection: "services",
    meta: { one_field: "related", junction_field: "related_services_id", sort_field: null },
    schema: { on_delete: "CASCADE" },
  });
  await api("POST", "/relations", {
    collection: "services_related",
    field: "related_services_id",
    related_collection: "services",
    meta: { one_field: null, junction_field: "services_id" },
    schema: { on_delete: "CASCADE" },
  });
  await api(
    "POST",
    "/fields/services",
    {
      field: "related",
      type: "alias",
      meta: { special: ["m2m"], interface: "list-m2m", note: "Похожие услуги" },
    },
    { allow: [400] },
  );
  console.log("создана связь похожих услуг");
}
console.log("готово");
