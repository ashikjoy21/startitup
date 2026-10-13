import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { assertAdminSecret, getSupabaseAdmin } from "../supabase.server";

export type IngestKpis = {
  live: number;
  with_apply_url: number;
  with_deadline: number;
  merged_across_sources: number;
  expired_24h: number;
  needs_review: number;
  failing_sources: number;
  disabled_sources: number;
  orgs_without_source: number;
  sources_by_method: Record<string, number>;
};

export type AdminSourceRow = {
  id: string;
  slug: string;
  connector: string;
  discovery_method: string;
  enabled: boolean;
  trusted: boolean;
  run_requested: boolean;
  last_run_at: string | null;
  last_success_at: string | null;
  last_item_count: number | null;
  consecutive_failures: number;
  last_error: string | null;
  permission_note: string;
  organizations: { name: string } | null;
};

export type ReviewItem = {
  id: string;
  name: string;
  org: string;
  location: string;
  kind: string | null;
  apply_url: string | null;
  review_reasons: string[];
};

const secret = z.object({ adminSecret: z.string().min(1) });

export const adminIngestOverview = createServerFn({ method: "POST" })
  .inputValidator(secret)
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);
    const supabase = getSupabaseAdmin();
    const [kpis, sources] = await Promise.all([
      supabase.rpc("ingest_kpis"),
      supabase
        .from("sources")
        .select(
          "id, slug, connector, discovery_method, enabled, trusted, run_requested, last_run_at, last_success_at, last_item_count, consecutive_failures, last_error, permission_note, organizations(name)",
        )
        .order("consecutive_failures", { ascending: false })
        .order("last_run_at", { ascending: false, nullsFirst: true })
        .limit(300),
    ]);
    if (kpis.error) throw new Error(kpis.error.message);
    if (sources.error) throw new Error(sources.error.message);
    return { kpis: kpis.data as IngestKpis, sources: (sources.data ?? []) as unknown as AdminSourceRow[] };
  });

export const adminUpdateSource = createServerFn({ method: "POST" })
  .inputValidator(
    secret.extend({
      id: z.string().uuid(),
      enabled: z.boolean().optional(),
      trusted: z.boolean().optional(),
      runRequested: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);
    const patch: Record<string, boolean | number> = {};
    if (data.enabled !== undefined) {
      patch.enabled = data.enabled;
      if (data.enabled) patch.consecutive_failures = 0;
    }
    if (data.trusted !== undefined) patch.trusted = data.trusted;
    if (data.runRequested !== undefined) patch.run_requested = data.runRequested;
    const { error } = await getSupabaseAdmin().from("sources").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminReviewQueue = createServerFn({ method: "POST" })
  .inputValidator(secret.extend({ limit: z.number().int().min(1).max(200).default(100) }))
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);
    const { data: rows, error } = await getSupabaseAdmin()
      .from("opportunities")
      .select("id, name, org, location, kind, apply_url, review_reasons")
      .contains("audience", ["student"])
      .eq("status", "published")
      .eq("review_state", "needs_review")
      .order("updated_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return { items: (rows ?? []) as ReviewItem[] };
  });

export const adminReviewListings = createServerFn({ method: "POST" })
  .inputValidator(
    secret.extend({ ids: z.array(z.string().min(1)).min(1).max(500), decision: z.enum(["ok", "rejected"]) }),
  )
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);
    const { error } = await getSupabaseAdmin()
      .from("opportunities")
      .update({ review_state: data.decision, review_locked: true })
      .in("id", data.ids)
      .contains("audience", ["student"]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
