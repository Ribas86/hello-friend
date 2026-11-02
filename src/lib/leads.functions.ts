import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const leadSchema = z.object({
  form_type: z.enum([
    "general",
    "business",
    "home",
    "calculator_home",
    "calculator_business",
    "maintenance",
  ]),
  name: z.string().trim().min(1, "Укажите имя").max(100),
  phone: z
    .string()
    .trim()
    .min(5, "Укажите телефон")
    .max(30)
    .regex(/^[+\d\s()-]+$/, "Телефон может содержать только цифры, пробелы, +, ( ) и -"),
  company: z.string().trim().max(200).optional(),
  object_type: z.string().trim().max(100).optional(),
  service: z.string().trim().max(200).optional(),
  comment: z.string().trim().max(2000).optional(),
  details: z.record(z.union([z.string().max(500), z.number(), z.boolean()])).optional(),
  source_page: z.string().max(300).optional(),
  website: z.string().max(0).optional(), // honeypot — must stay empty
  consent: z.literal(true, { errorMap: () => ({ message: "Нужно согласие на обработку данных" }) }),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
            h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { error } = await supabase.from("leads").insert({
      form_type: data.form_type,
      name: data.name,
      phone: data.phone,
      company: data.company || null,
      object_type: data.object_type || null,
      service: data.service || null,
      comment: data.comment || null,
      details: data.details ?? {},
      source_page: data.source_page || null,
    });
    if (error) {
      console.error("lead insert failed", error.message);
      throw new Error("Не удалось сохранить заявку. Попробуйте ещё раз.");
    }
    return { ok: true as const };
  });
