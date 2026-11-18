// Серверные вспомогательные функции SEO. Только для серверных обработчиков.
import { getRequest } from "@tanstack/react-start/server";

/** Публичный адрес сайта: из SITE_DOMAIN (как в .env), иначе из заголовков запроса. */
export function baseUrl(): string {
  const d = process.env["SITE_DOMAIN"]?.trim();
  if (d) return (/^https?:\/\//.test(d) ? d : `https://${d}`).replace(/\/+$/, "");
  const req = getRequest();
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

/** Закрыт ли сайт от индексации (тестовый сервер без домена). */
export const noindex = (): boolean => process.env["ROBOTS_DISALLOW"] === "1";
