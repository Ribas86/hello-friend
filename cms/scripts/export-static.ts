// Одноразовая выгрузка текущих данных из src/lib/site.ts в cms/seed/data.json.
import { writeFileSync } from "node:fs";
import { company, services, faq } from "../../src/lib/site";
writeFileSync(
  new URL("../seed/data.json", import.meta.url),
  JSON.stringify({ company, services, faq }, null, 2),
);
console.log("услуг:", services.length, "общих вопросов:", faq.length);
