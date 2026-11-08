// Создаёт сотрудника сразу с обязательным TOTP: без кода из приложения войти нельзя.
// Использование: node scripts/create-user.mjs email@компания.ру Редактор|Администратор
import crypto from "node:crypto";
import pg from "pg";
import { login, api } from "./lib.mjs";

const [email, roleName = "Редактор"] = process.argv.slice(2);
if (!email) {
  console.error("Укажите email: node scripts/create-user.mjs name@example.ru Редактор");
  process.exit(1);
}
const b32 = (buf) => {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "",
    out = "";
  for (const b of buf) bits += b.toString(2).padStart(8, "0");
  for (let i = 0; i < bits.length; i += 5)
    out += A[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return out;
};

await login();
const role = (await api("GET", `/roles?filter[name][_eq]=${encodeURIComponent(roleName)}&limit=1`))
  .data[0];
if (!role) throw new Error(`Нет роли «${roleName}». Доступны: Администратор, Редактор`);
const password = crypto.randomBytes(12).toString("base64url");
const secret = b32(crypto.randomBytes(20));
const existing = (
  await api("GET", `/users?filter[email][_eq]=${encodeURIComponent(email)}&limit=1`)
).data[0];
const body = { email, role: role.id, password, status: "active" };
const user = existing
  ? (await api("PATCH", `/users/${existing.id}`, body)).data
  : (await api("POST", "/users", body)).data;
// Directus не позволяет задать секрет TOTP через API (а редактор без лицензионных прав не может включить его сам),
// поэтому секрет записывается напрямую в базу. Формат тот же, что создаёт сама панель (проверено).
const db = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
await db.connect();
const upd = await db.query("UPDATE directus_users SET tfa_secret = $1 WHERE id = $2", [
  secret,
  user.id,
]);
await db.end();
if (upd.rowCount !== 1) throw new Error("Не удалось записать секрет TOTP");
const uri = `otpauth://totp/${encodeURIComponent("Центр Квелити")}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent("Центр Квелити")}`;
console.log(
  `Сотрудник: ${email} (${roleName})\nВременный пароль: ${password}\nСекрет TOTP: ${secret}\nСсылка для приложения-аутентификатора:\n${uri}`,
);
console.log(
  "Передайте пароль и секрет по разным каналам. Секрет добавляют в Google Authenticator / Яндекс Ключ / Aegis (ввод ключа вручную).",
);
