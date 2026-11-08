// Общие функции для скриптов: вход и запросы к Directus REST API.
const URL_ = process.env.PUBLIC_URL ?? "http://localhost:8055";
let token;
export async function login() {
  // Служебный токен администратора (ADMIN_TOKEN) надёжнее пароля: он не зависит от TOTP.
  if (process.env.ADMIN_TOKEN) {
    token = process.env.ADMIN_TOKEN;
    return;
  }
  const r = await fetch(`${URL_}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
  });
  if (!r.ok) throw new Error(`login ${r.status}: ${await r.text()}`);
  token = (await r.json()).data.access_token;
}
export async function api(method, path, body, { allow = [] } = {}) {
  const r = await fetch(`${URL_}${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok && !allow.includes(r.status))
    throw new Error(`${method} ${path} -> ${r.status}: ${await r.text()}`);
  return r.status === 204 ? null : r.json().catch(() => null);
}
