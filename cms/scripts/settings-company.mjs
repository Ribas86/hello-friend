// Обновить название и адрес компании в «Настройках сайта» (site_settings).
// Меняет только три поля; остальные настройки не трогает. Значения — из реквизитов заказчика (19.11.2026).
import { login, api } from "./lib.mjs";

const values = {
  company_name: "ООО «Центр «Квэлити»»",
  short_name: "Центр Квэлити",
  address: "127106, г. Москва, ул. Гостиничная, д. 5",
};
await login();
const before = (await api("GET", "/items/site_settings?fields=company_name,short_name,address"))
  ?.data;
console.log("было:", JSON.stringify(before));
await api("PATCH", "/items/site_settings", values);
const after = (await api("GET", "/items/site_settings?fields=company_name,short_name,address"))
  ?.data;
console.log("стало:", JSON.stringify(after));
