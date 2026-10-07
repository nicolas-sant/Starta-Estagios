import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export const listPublicJobs = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return [];
  const client = createClient(url, key, { auth: { persistSession: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization"); headers.set("apikey", key); return fetch(input, { ...init, headers }); } } });
  const { data, error } = await client.from("recruiter_public_jobs").select("job,status");
  if (error) throw new Error("Não foi possível carregar as vagas publicadas.");
  return data || [];
});