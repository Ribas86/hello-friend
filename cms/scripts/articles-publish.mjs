// Записать статьи в CMS (коллекция articles) из JSON-файла.
// Статья ищется по slug: есть — обновляется, нет — создаётся. Другие статьи не трогаются.
// Запуск: node scripts/articles-publish.mjs content/articles-2026-11.json
import { readFileSync } from "node:fs";
import { login, api } from "./lib.mjs";

const file = process.argv[2];
if (!file) throw new Error("Укажите файл со статьями");
const articles = JSON.parse(readFileSync(file, "utf8"));
const TOPIC = { slug: "videonablyudenie", title: "Видеонаблюдение" };

await login();
const topics = (await api("GET", `/items/article_topics?filter[slug][_eq]=${TOPIC.slug}&fields=id`))
  ?.data;
const topicId = topics?.[0]?.id ?? (await api("POST", "/items/article_topics", TOPIC))?.data?.id;
console.log("тема:", TOPIC.title, topicId, topics?.length ? "(была)" : "(создана)");

for (const a of articles) {
  const item = { ...a, status: "published", topic: topicId };
  const found = (await api("GET", `/items/articles?filter[slug][_eq]=${a.slug}&fields=id`))?.data;
  if (found?.length) {
    await api("PATCH", `/items/articles/${found[0].id}`, item);
    console.log("обновлена:", a.slug);
  } else {
    await api("POST", "/items/articles", item);
    console.log("создана:", a.slug);
  }
}
const all = (await api("GET", "/items/articles?fields=slug,status&limit=-1"))?.data;
console.log("всего статей в CMS:", JSON.stringify(all));
