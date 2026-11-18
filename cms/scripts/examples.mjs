// Примеры объектов портфолио ТОЛЬКО для тестового сервера (адреса начинаются с primer-).
// Перед запуском боевого сайта удалить: node scripts/examples.mjs remove
import fs from "node:fs";
import { login, api, authHeader, baseUrl } from "./lib.mjs";

const action = process.argv[2];
if (!["add", "remove"].includes(action)) {
  console.log("использование: node scripts/examples.mjs add|remove");
  process.exit(1);
}
await login();

const examples = [
  {
    slug: "primer-bolnica",
    image: "hospital.jpg",
    direction: "videonablyudenie",
    title: "Видеонаблюдение и СКУД для многопрофильной больницы",
    object_type: "Больница",
    year: 2025,
    summary: "Видеоконтроль территории и корпусов, контроль доступа в служебные помещения.",
    task: "Обеспечить видеоконтроль входных групп, приёмного отделения, коридоров, парковки и территории, ограничить доступ в служебные помещения и аптеку.",
    done: "Обследование корпусов и территории\nПроект системы с расстановкой камер и зонами обзора\nМонтаж 64 IP-камер внутри и снаружи\nСерверная с архивом записи на 30 дней\nСКУД на 18 дверей служебных помещений\nПусконаладка и обучение охраны",
    equipment:
      "IP-камеры 4 Мп, купольные и цилиндрические\nСервер видеозаписи с RAID-массивом\nКонтроллеры и считыватели СКУД\nИБП для серверной и коммутаторов",
    result:
      "Охрана видит территорию и приёмное отделение с одного поста, доступ в служебные помещения — только по картам сотрудников.",
  },
  {
    slug: "primer-sklad",
    image: "warehouse.jpg",
    direction: "videonablyudenie",
    title: "Видеонаблюдение для логистического склада",
    object_type: "Склад",
    year: 2024,
    summary: "Контроль территории, рампы и зоны хранения на складе площадью 6 000 м².",
    task: "Исключить «слепые зоны» на территории и в зоне хранения, фиксировать погрузку у каждых ворот рампы и номера машин на въезде.",
    done: "Обследование склада и территории\nПроект с расчётом зон обзора по стеллажам\nМонтаж 42 камер, из них 4 — для распознавания номеров\nПрокладка кабельных трасс по металлоконструкциям\nУдалённый доступ для руководства\nДоговор на техническое обслуживание",
    equipment:
      "IP-камеры с ИК-подсветкой\nКамеры для распознавания номеров\nВидеорегистраторы на 32 канала\nУправляемые коммутаторы PoE",
    result:
      "Каждая погрузка у рампы записывается, спорные ситуации с перевозчиками решаются по архиву за минуты.",
  },
  {
    slug: "primer-aeroport",
    image: "airport.jpg",
    direction: "kompleksnye-sistemy",
    title: "Система безопасности для терминала аэропорта",
    object_type: "Аэропорт",
    year: 2025,
    summary: "Видеонаблюдение терминала и перрона, интеграция с СКУД служебных зон.",
    task: "Организовать видеоконтроль терминала, перрона и подъездных путей, объединить видеонаблюдение и контроль доступа служебных зон в одну систему.",
    done: "Обследование терминала, перрона и вышки\nПроект комплексной системы\nМонтаж 120 камер, включая поворотные для перрона\nИнтеграция видеонаблюдения со СКУД\nРезервирование питания и каналов связи\nСдача системы и обучение персонала",
    equipment:
      "Поворотные PTZ-камеры для перрона\nКупольные камеры для терминала\nСерверы видеозаписи с резервированием\nПрограммная платформа видеонаблюдения со СКУД",
    result:
      "Операторы видят терминал и перрон на общей видеостене, проход в служебные зоны отражается в системе вместе с видео.",
  },
];

const find = async (path) => (await api("GET", path)).data;

if (action === "add") {
  for (const e of examples) {
    if ((await find(`/items/projects?filter[slug][_eq]=${e.slug}&fields=id`)).length) {
      console.log("уже есть", e.slug);
      continue;
    }
    const form = new FormData();
    form.append("title", e.title);
    form.append(
      "file",
      new Blob([fs.readFileSync(new URL(`../examples/${e.image}`, import.meta.url))], {
        type: "image/jpeg",
      }),
      e.image,
    );
    const up = await fetch(`${baseUrl()}/files`, {
      method: "POST",
      headers: authHeader(),
      body: form,
    });
    if (!up.ok) throw new Error(`загрузка ${e.image} -> ${up.status}: ${await up.text()}`);
    const cover = (await up.json()).data.id;
    const dir = (await find(`/items/directions?filter[slug][_eq]=${e.direction}&fields=id`))[0];
    const { image: _image, direction: _direction, ...fields } = e;
    await api("POST", "/items/projects", {
      ...fields,
      status: "published",
      cover,
      ...(dir ? { direction: dir.id } : {}),
    });
    console.log("добавлен", e.slug);
  }
} else {
  const rows = await find(
    `/items/projects?filter[slug][_starts_with]=primer-&fields=id,slug,cover`,
  );
  for (const r of rows) {
    await api("DELETE", `/items/projects/${r.id}`);
    if (r.cover) await api("DELETE", `/files/${r.cover}`, undefined, { allow: [403, 404] });
    console.log("удалён", r.slug);
  }
  if (!rows.length) console.log("примеров нет");
}
