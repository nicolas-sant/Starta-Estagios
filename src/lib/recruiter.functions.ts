import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const loadWorkspace = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("recruiter_workspaces").select("state").eq("owner_id", context.userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.state ?? null;
});

export const persistWorkspace = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ state: z.record(z.unknown()), jobs: z.array(z.object({ id: z.string(), companyId: z.string(), status: z.string(), job: z.record(z.unknown()) })) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("recruiter_workspaces").upsert({ owner_id: context.userId, state: JSON.parse(JSON.stringify(data.state)), updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    if (data.jobs.length) {
      const { error: jobError } = await context.supabase.from("recruiter_public_jobs").upsert(data.jobs.map((j) => ({ id: `${context.userId}:${j.id}`, owner_id: context.userId, company_id: j.companyId, status: j.status, job: JSON.parse(JSON.stringify(j.job)) })));
      if (jobError) throw new Error(jobError.message);
    }
    return { ok: true };
  });