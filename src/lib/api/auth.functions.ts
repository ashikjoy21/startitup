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
import type { DbOpportunity, SavedStatus } from "../database.types";
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
  startup_name: string | null;
  location: string | null;
  team_size: number | null;
  funding_raised: string | null;
  incorporated: boolean;
  dpiit_recognized: boolean;
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

function parseDeadline(s: string): Date | null {
  if (!s || /rolling|open|ongoing|tba|tbd|n\/a/i.test(s)) return null;
  const direct = new Date(s);
  if (!isNaN(direct.getTime())) return direct;
  const monthYear = s.match(/([A-Za-z]+)\s+(\d{4})/);
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export type PipelineOpportunity = Opportunity & { savedStatus: SavedStatus };
export type IncubatorMatch = Opportunity & { matchScore: number };
export type UpcomingDeadline = {
  id: string;
  name: string;
  org: string;
  deadline: string;
  deadlineDate: string;
  daysUntil: number;
  isSaved: boolean;
};

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
      profileCompleteness: 0,
      savedCount: 0,
      appliedCount: 0,
      totalCount: seedOpportunities.length,
      newThisWeekCount: 0,
      deadlinesThisWeek: 0,
      actionItems: seedOpportunities.slice(0, 4) as Opportunity[],
      pipeline: { saved: [], applied: [], under_review: [], won: [] } as Record<SavedStatus, PipelineOpportunity[]>,
      incubatorMatches: [] as IncubatorMatch[],
      upcomingDeadlines: [] as UpcomingDeadline[],
    };
  }

  const supabase = getSupabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date();

  const [profileRaw, savedRows, totalResult, candidateRows, newIdsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => data),
    supabase
      .from("saved_opportunities")
      .select("opportunity_id, status, opportunities(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("opportunities")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(100),
    supabase
      .from("opportunities")
      .select("id")
      .eq("status", "published")
      .gte("published_at", sevenDaysAgo)
      .limit(200),
  ]);

  const p = profileRaw as UserProfile | null;

  // Profile completeness: 7 text/number fields
  const completenessFields = [
    p?.startup_name,
    p?.stage,
    p?.sector,
    p?.funding_status,
    p?.location,
    p?.team_size != null ? String(p.team_size) : null,
    p?.funding_raised,
  ];
  const profileCompleteness = Math.round(
    (completenessFields.filter((v) => v !== null && v !== undefined && v !== "").length /
      completenessFields.length) *
      100,
  );

  // Pipeline: group saved opportunities by status
  const savedRowsData = savedRows.data ?? [];
  const pipeline: Record<SavedStatus, PipelineOpportunity[]> = {
    saved: [],
    applied: [],
    under_review: [],
    won: [],
  };
  const savedOpportunityIds = new Set<string>();
  for (const row of savedRowsData) {
    if (!row.opportunities) continue;
    const opp = toOpportunity(row.opportunities as unknown as DbOpportunity);
    const status = ((row.status as SavedStatus) ?? "saved") as SavedStatus;
    savedOpportunityIds.add(opp.id);
    pipeline[status].push({ ...opp, savedStatus: status });
  }
  const savedCount = savedRowsData.length;
  const appliedCount =
    pipeline.applied.length + pipeline.under_review.length + pipeline.won.length;

  // Score all candidates against profile
  const candidates = (candidateRows.data ?? []).map((r) => toOpportunity(r as DbOpportunity));
  const newIds = new Set((newIdsResult.data ?? []).map((r) => r.id as string));
  const pStage = p?.stage?.toLowerCase() ?? "";
  const pSector = p?.sector?.toLowerCase() ?? "";
  const sectorParts = pSector.split(/[/\s]+/).filter(Boolean);

  const scored = candidates.map((o) => {
    let score = 0;
    const oStage = o.stage.toLowerCase();
    const oIndustry = o.industry.toLowerCase();
    if (pStage && oStage === pStage) score += 3;
    else if (oStage === "any") score += 1;
    if (sectorParts.length > 0 && sectorParts.some((part) => oIndustry.includes(part)))
      score += 3;
    else if (oIndustry === "all") score += 1;
    return { o, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // Action items: top 4 recommendations not already in pipeline
  const actionItems = scored
    .filter(({ o }) => !savedOpportunityIds.has(o.id))
    .slice(0, 4)
    .map(({ o }) => o);

  // Incubator matches: top 4 from incubator/accelerator category, scored
  const incubatorMatches: IncubatorMatch[] = scored
    .filter(({ o }) => /incubator|accelerator/i.test(o.category))
    .slice(0, 4)
    .map(({ o, score }) => ({ ...o, matchScore: Math.min(98, 60 + score * 8) }));

  // Upcoming deadlines: next 5 future deadlines from all published opportunities
  const now2 = now;
  const allWithDeadlines = candidates
    .map((o) => ({ o, date: parseDeadline(o.deadline) }))
    .filter((x): x is { o: Opportunity; date: Date } => x.date !== null && x.date > now2)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const upcomingDeadlines: UpcomingDeadline[] = allWithDeadlines.map(({ o, date }) => ({
    id: o.id,
    name: o.name,
    org: o.org,
    deadline: o.deadline,
    deadlineDate: date.toISOString(),
    daysUntil: Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    isSaved: savedOpportunityIds.has(o.id),
  }));

  // Deadlines this week: saved opportunities with deadline in next 7 days
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const deadlinesThisWeek = upcomingDeadlines.filter(
    (d) => savedOpportunityIds.has(d.id) && new Date(d.deadlineDate) <= nextWeek,
  ).length;

  return {
    authenticated: true as const,
    name,
    profile: p,
    profileCompleteness,
    savedCount,
    appliedCount,
    totalCount: totalResult.count ?? 0,
    newThisWeekCount: newIds.size,
    deadlinesThisWeek,
    actionItems,
    pipeline,
    incubatorMatches,
    upcomingDeadlines,
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

export const updateSavedStatus = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      opportunityId: z.string().min(1),
      status: z.enum(["saved", "applied", "under_review", "won"]),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("saved_opportunities")
      .update({ status: data.status })
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
