import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getUser } from "../auth.server";
import { getSupabaseAdmin } from "../supabase.server";

export const getSavedIds = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getUser();
  if (!user) return [] as string[];

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("saved_opportunities")
    .select("opportunity_id")
    .eq("user_id", user.id);

  return (data ?? []).map((r) => r.opportunity_id as string);
});

export const saveOpportunity = createServerFn({ method: "POST" })
  .inputValidator(z.object({ opportunityId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("saved_opportunities")
      .upsert(
        { user_id: user.id, opportunity_id: data.opportunityId },
        { onConflict: "user_id,opportunity_id", ignoreDuplicates: true },
      );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const unsaveOpportunity = createServerFn({ method: "POST" })
  .inputValidator(z.object({ opportunityId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("saved_opportunities")
      .delete()
      .eq("user_id", user.id)
      .eq("opportunity_id", data.opportunityId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const upsertProfile = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      stage: z.string().min(1),
      sector: z.string().min(1),
      fundingStatus: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      stage: data.stage,
      sector: data.sector,
      funding_status: data.fundingStatus,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
