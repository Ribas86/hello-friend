// Записать статьи в CMS (коллекция articles) из JSON-файла.
// Статья ищется по slug: есть — обновляется, нет — создаётся. Другие статьи не трогаются.
// Картинки: в body и cover можно указать {{file:имя.jpg}} — файл берётся из папки media рядом с JSON,
// загружается в CMS (если файла с таким именем ещё нет) и подставляется: в cover — id файла, в body — /media/<id>.
// Запуск: node scripts/articles-publish.mjs content/articles-2026-11.json
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { login, api, authHeader, baseUrl } from "./lib.mjs";

const file = process.argv[2];
if (!file) throw new Error("Укажите файл со статьями");
const articles = JSON.parse(readFileSync(file, "utf8"));
const mediaDir = join(dirname(file), "media");
const DEFAULT_TOPIC = { slug: "videonablyudenie", title: "Видеонаблюдение" };

await login();

const topicIds = new Map();
async function topicId(t) {
  if (topicIds.has(t.slug)) return topicIds.get(t.slug);
  const found = (await api("GET", `/items/article_topics?filter[slug][_eq]=${t.slug}&fields=id`))
    ?.data;
  const id = found?.[0]?.id ?? (await api("POST", "/items/article_topics", t))?.data?.id;
  console.log("тема:", t.title, id, found?.length ? "(была)" : "(создана)");
  topicIds.set(t.slug, id);
  return id;
}

const fileIds = new Map();
async function fileId(name) {
  if (fileIds.has(name)) return fileIds.get(name);
  const found = (
    await api(
      "GET",
      `/files?filter[filename_download][_eq]=${encodeURIComponent(name)}&fields=id&limit=1`,
    )
  )?.data;
  let id = found?.[0]?.id;
  if (!id) {
    const path = join(mediaDir, name);
    if (!existsSync(path)) throw new Error(`нет файла ${path}`);
    const form = new FormData();
    form.append("title", name);
    form.append("file", new Blob([readFileSync(path)], { type: "image/jpeg" }), name);
    const r = await fetch(`${baseUrl()}/files`, {
      method: "POST",
      headers: authHeader(),
      body: form,
    });
    if (!r.ok) throw new Error(`upload ${name} -> ${r.status}: ${await r.text()}`);
    id = (await r.json()).data.id;
    console.log("файл загружен:", name, id);
  } else console.log("файл уже есть:", name, id);
  fileIds.set(name, id);
  return id;
}

async function resolveFiles(text) {
  if (!text) return text;
  let out = text;
  for (const [, name] of text.matchAll(/\{\{file:([^}]+)\}\}/g)) {
    out = out.replaceAll(`{{file:${name}}}`, `/media/${await fileId(name)}`);
  }
  return out;
}

for (const a of articles) {
  const { topic, cover, ...rest } = a;
  const coverMatch = typeof cover === "string" && cover.match(/^\{\{file:([^}]+)\}\}$/);
  const item = {
    ...rest,
    body: await resolveFiles(rest.body),
    status: "published",
    topic: await topicId(topic ?? DEFAULT_TOPIC),
    ...(coverMatch ? { cover: await fileId(coverMatch[1]) } : {}),
  };
  const found = (await api("GET", `/items/articles?filter[slug][_eq]=${a.slug}&fields=id`))?.data;
  if (found?.length) {
    await api("PATCH", `/items/articles/${found[0].id}`, item);
    console.log("обновлена:", a.slug);
  } else {
    await api("POST", "/items/articles", item);
    console.log("создана:", a.slug);
  }
}
const all = (await api("GET", "/items/articles?fields=slug,status,cover&limit=-1"))?.data;
console.log("всего статей в CMS:", JSON.stringify(all));
