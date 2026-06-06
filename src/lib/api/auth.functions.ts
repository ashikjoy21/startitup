import { createServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import {
  createSupabaseSSRClient,
  getProfile,
  getUser,
  serializeCookie,
} from "../auth.server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../supabase.server";
import type { Opportunity } from "../opportunities";
import { toOpportunity } from "../opportunity-mapper";
import type { DbOpportunity } from "../database.types";
import { listOpportunities } from "./opportunities.functions";

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type UserProfile = {
  id: string;
  stage: string | null;
  sector: string | null;
  funding_status: string | null;
};

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata as Record<string, unknown>,
  };
}

export const fetchRootAuth = createServerFn({ method: "GET" }).handler(async () => {
  if (!isSupabaseConfigured()) {
    return { user: null as AuthUser | null, savedIds: [] as string[] };
  }
  try {
    const user = await getUser();
    if (!user) return { user: null, savedIds: [] as string[] };

    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .eq("user_id", user.id);

    return {
      user: toAuthUser(user),
      savedIds: (data ?? []).map((r) => r.opportunity_id as string),
    };
  } catch {
    return { user: null, savedIds: [] as string[] };
  }
});

export const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getUser();
  return user ? toAuthUser(user) : null;
});

export const loadProfile = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getUser();
  if (!user) return { authenticated: false as const };
  const profile = await getProfile(user.id);
  return { authenticated: true as const, profile: profile as UserProfile | null };
});

export const loadDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getUser();
  if (!user) return { authenticated: false as const };

  const rawName = user.user_metadata?.name;
  const name = (typeof rawName === "string" ? rawName : "").split(" ")[0] || "Founder";

  if (!isSupabaseConfigured()) {
    const { seedOpportunities } = await import("../opportunities");
    return {
      authenticated: true as const,
      name,
      profile: null as UserProfile | null,
      savedCount: 0,
      totalCount: seedOpportunities.length,
      newThisWeekCount: 0,
      recs: seedOpportunities.slice(0, 6) as Opportunity[],
      newItems: [] as Opportunity[],
    };
  }

  const supabase = getSupabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [profile, savedCount, totalResult, candidateRows, newRows] = await Promise.all([
    getProfile(user.id),
    supabase
      .from("saved_opportunities")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => count ?? 0),
    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("opportunities")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50),
    supabase
      .from("opportunities")
      .select("id")
      .eq("status", "published")
      .gte("published_at", sevenDaysAgo)
      .limit(100),
  ]);

  const candidates = (candidateRows.data ?? []).map((r) => toOpportunity(r as DbOpportunity));
  const newIds = new Set((newRows.data ?? []).map((r) => r.id as string));

  const p = profile as UserProfile | null;
  const pStage = p?.stage?.toLowerCase() ?? "";
  const pSector = p?.sector?.toLowerCase() ?? "";
  const sectorParts = pSector.split(/[/\s]+/).filter(Boolean);

  const scored = candidates.map((o) => {
    let score = 0;
    const oStage = o.stage.toLowerCase();
    const oIndustry = o.industry.toLowerCase();
    if (pStage && oStage === pStage) score += 3;
    else if (oStage === "any") score += 1;
    if (sectorParts.length > 0 && sectorParts.some((part) => oIndustry.includes(part))) score += 3;
    else if (oIndustry === "all") score += 1;
    return { o, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const recs = scored.slice(0, 6).map(({ o }) => o);
  const recIds = new Set(recs.map((o) => o.id));

  const newItems = candidates
    .filter((o) => newIds.has(o.id) && !recIds.has(o.id))
    .slice(0, 3);

  return {
    authenticated: true as const,
    name,
    profile: p,
    savedCount,
    totalCount: totalResult.count ?? 0,
    newThisWeekCount: newIds.size,
    recs,
    newItems,
  };
});

export const loadSavedOpportunities = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getUser();
  if (!user) return { authenticated: false as const, items: [] as Opportunity[] };

  if (!isSupabaseConfigured()) {
    return { authenticated: true as const, items: [] as Opportunity[] };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("saved_opportunities")
    .select("opportunity_id, opportunities(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const items = (data ?? [])
    .map((row) => row.opportunities)
    .filter(Boolean)
    .map((row) => toOpportunity(row as DbOpportunity));

  return { authenticated: true as const, items };
});

export const completeAuthCallback = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      code: z.string().min(1),
      next: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { supabase, getPending } = createSupabaseSSRClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(data.code);

    if (error || !sessionData.user) {
      return { ok: false as const, destination: "/login" as const, cookieHeaders: [] as [string, string][] };
    }

    const profile = await getProfile(sessionData.user.id);
    const destination = profile ? (data.next ?? "/dashboard") : "/onboarding";

    const cookieHeaders = getPending().map(
      (c): [string, string] => ["Set-Cookie", serializeCookie(c.name, c.value, c.options)],
    );

    return { ok: true as const, destination, cookieHeaders };
  });

export const completeLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { supabase, getPending } = createSupabaseSSRClient();
  await supabase.auth.signOut();

  const cookieHeaders = getPending().map(
    (c): [string, string] => ["Set-Cookie", serializeCookie(c.name, c.value, c.options)],
  );

  return { cookieHeaders };
});

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
