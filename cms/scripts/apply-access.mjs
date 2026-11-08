// Роли и права: Администратор (встроенный), Редактор, служебный читатель для сайта.
// Включает обязательный TOTP для людей. Саморегистрация выключена.
import crypto from "node:crypto";
import { login, api } from "./lib.mjs";

const content = [
  "audiences",
  "categories",
  "services",
  "services_related",
  "service_faq",
  "article_topics",
  "articles",
  "pages",
  "calc_object_types",
  "calc_scenarios",
  "calc_questions",
  "calc_options",
  "calc_price_items",
  "calc_rules",
];
// Фильтры в правах (только опубликованное) в бесплатной версии недоступны: Directus требует лицензионный ключ
// (custom_permission_rules_enabled). Поэтому сайт сам запрашивает только status=published.
const enforceTfa = process.env.ENFORCE_TFA !== "0";

await login();
const find = async (path, name) =>
  (await api("GET", `${path}?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`)).data[0];

async function policy(name, body) {
  let p = await find("/policies", name);
  if (p) {
    await api("PATCH", `/policies/${p.id}`, body);
  } else {
    p = (await api("POST", "/policies", { name, ...body })).data;
  }
  return await find("/policies", name);
}
async function role(name, policyId) {
  let r = await find("/roles", name);
  if (!r) r = (await api("POST", "/roles", { name })).data;
  const acc = (
    await api("GET", `/access?filter[role][_eq]=${r.id}&filter[policy][_eq]=${policyId}`)
  ).data;
  if (!acc.length) await api("POST", "/access", { role: r.id, policy: policyId });
  return r;
}
async function setPermissions(policyId, perms) {
  const old = (await api("GET", `/permissions?filter[policy][_eq]=${policyId}&limit=-1`)).data.map(
    (p) => p.id,
  );
  if (old.length) await api("DELETE", "/permissions", old);
  await api(
    "POST",
    "/permissions",
    perms.map((p) => ({ policy: policyId, fields: ["*"], permissions: {}, ...p })),
  );
}

// Администратор: встроенная политика с admin_access
const admin = (await api("GET", "/policies?filter[admin_access][_eq]=true&limit=1")).data[0];
await api("PATCH", `/policies/${admin.id}`, { enforce_tfa: enforceTfa, name: "Администратор" });

// Редактор: контент без доступа к пользователям, ролям и настройкам системы
const editor = await policy("Редактор", {
  icon: "edit",
  description: "Редактирует контент, цены калькулятора и файлы",
  admin_access: false,
  app_access: true,
  enforce_tfa: enforceTfa,
});
await setPermissions(editor.id, [
  ...content.flatMap((c) =>
    ["create", "read", "update", "delete"].map((action) => ({ collection: c, action })),
  ),
  ...["read", "update"].map((action) => ({ collection: "site_settings", action })),
  ...["read", "update"].map((action) => ({ collection: "calc_settings", action })),
  { collection: "redirects", action: "read" },
  ...["create", "read", "update"].map((action) => ({ collection: "directus_files", action })),
  { collection: "directus_folders", action: "read" },
]);
await role("Редактор", editor.id);

// Читатель для сайта: только чтение опубликованного, без входа в панель
const reader = await policy("Читатель сайта", {
  icon: "visibility",
  description: "Служебный доступ сайта на чтение",
  admin_access: false,
  app_access: false,
  enforce_tfa: false,
});
await setPermissions(reader.id, [
  ...[...content, "site_settings", "calc_settings", "redirects"].map((c) => ({
    collection: c,
    action: "read",
  })),
  { collection: "directus_files", action: "read" },
]);
const readerRole = await role("Читатель сайта", reader.id);
let user = (await api("GET", `/users?filter[email][_eq]=site-reader@example.com&limit=1`)).data[0];
const siteToken = process.env.SITE_READER_TOKEN || crypto.randomBytes(24).toString("hex");
if (!user)
  user = (
    await api("POST", "/users", {
      email: "site-reader@example.com",
      first_name: "Сайт",
      last_name: "(чтение)",
      role: readerRole.id,
      token: siteToken,
      password: crypto.randomBytes(24).toString("hex"),
    })
  ).data;
else if (process.env.SITE_READER_TOKEN)
  await api("PATCH", `/users/${user.id}`, { token: siteToken });

// Саморегистрация и публичный доступ выключены
await api("PATCH", "/settings", {
  public_registration: false,
  project_name: "Центр Квелити — управление сайтом",
  project_descriptor: "Админ-панель",
});
console.log("роли готовы; обязательный TOTP:", enforceTfa);
console.log("SITE_READER_TOKEN=" + (process.env.SITE_READER_TOKEN ? "(задан вами)" : siteToken));
