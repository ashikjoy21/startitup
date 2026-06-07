import { createServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { createSupabaseSSRClient, getProfile, getUser, serializeCookie } from "../auth.server";
import { getSupabaseAdmin, isSupabaseConfigured } from "../supabase.server";
import type { Opportunity } from "../opportunities";
import { toOpportunity } from "../opportunity-mapper";
import type { DbOpportunity, SavedStatus } from "../database.types";
import {
  ACTION_RECOMMEND_MIN_SCORE,
  FUNDING_ESTIMATE_MIN_SCORE,
  FUNDING_ESTIMATE_TOP_N,
  industrySpecificity,
  isModeratePlusMatch,
  MATCH_LIST_MIN_SCORE,
  rankOpportunities,
  scoreOpportunity,
  type MatchReason,
  type MatchStrength,
  type MatchableProfile,
} from "../matching";
import { parseOpportunityDeadline } from "../deadline-status";
import { estimateFundingFromAmounts } from "../parse-opportunity-amount";

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
  women_led: boolean;
  student_led: boolean;
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

export const loadProfile = createServerFn({ method: "POST" }).handler(async () => {
  const user = await getUser();
  if (!user) return { authenticated: false as const };
  const profile = await getProfile(user.id);
  return { authenticated: true as const, profile: profile as UserProfile | null };
});

const parseDeadline = parseOpportunityDeadline;

export type PipelineOpportunity = Opportunity & { savedStatus: SavedStatus };
export type ScoredMatch = Opportunity & {
  matchScore: number;
  matchStrength: MatchStrength;
  matchReasons: MatchReason[];
  matchPenalties: MatchReason[];
};
/** @deprecated use ScoredMatch */
export type IncubatorMatch = ScoredMatch;
export type RecommendedOpportunity = Opportunity & {
  matchScore: number;
  matchStrength: MatchStrength;
  matchReasons: MatchReason[];
};
export type UpcomingDeadline = {
  id: string;
  name: string;
  org: string;
  deadline: string;
  deadlineDate: string;
  daysUntil: number;
  isSaved: boolean;
};

export const loadDashboard = createServerFn({ method: "POST" }).handler(async () => {
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
      actionRecommendedCount: 0,
      deadlinesThisWeek: 0,
      actionItems: seedOpportunities.slice(0, 4).map((o) => ({
        ...o,
        matchScore: 0,
        matchStrength: "weak" as const,
        matchReasons: [],
      })) as RecommendedOpportunity[],
      pipeline: { saved: [], applied: [], under_review: [], won: [] } as Record<
        SavedStatus,
        PipelineOpportunity[]
      >,
      incubatorMatches: [] as ScoredMatch[],
      allMatches: [] as ScoredMatch[],
      upcomingDeadlines: [] as UpcomingDeadline[],
      calendarDeadlines: [] as UpcomingDeadline[],
      potentialFundingInr: 0,
      potentialFundingCount: 0,
      relevantMatchCount: 0,
      fundingEstimateSize: 0,
      goodPlusMatchCount: 0,
    };
  }

  const supabase = getSupabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date();

  const [profileRaw, savedRows, totalResult, candidateRows, newIdsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => data),
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
      .limit(500),
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
    if (pipeline[status]) pipeline[status].push({ ...opp, savedStatus: status });
  }
  const savedCount = pipeline.saved.length;
  const appliedCount = pipeline.applied.length + pipeline.under_review.length + pipeline.won.length;

  // Score all candidates against profile using multi-dimensional engine
  const candidates = (candidateRows.data ?? []).map((r) => toOpportunity(r as DbOpportunity));
  const newIds = new Set((newIdsResult.data ?? []).map((r) => r.id as string));

  const matchProfile = p ?? {
    stage: null,
    sector: null,
    location: null,
    funding_status: null,
    funding_raised: null,
    team_size: null,
    dpiit_recognized: false,
    incorporated: false,
    women_led: false,
    student_led: false,
  };

  const scored = candidates.map((o) => {
    const result = scoreOpportunity(matchProfile, o, newIds.has(o.id));
    return { o, result };
  });
  scored.sort((a, b) => {
    const scoreDiff = b.result.score - a.result.score;
    if (scoreDiff !== 0) return scoreDiff;
    return industrySpecificity(b.o.industry) - industrySpecificity(a.o.industry);
  });

  // Action items: prefer sector-specific fits when the founder has set a sector
  const unsaved = scored.filter(({ o }) => !savedOpportunityIds.has(o.id));
  const toRecommended = ({ o, result }: (typeof scored)[number]): RecommendedOpportunity => ({
    ...o,
    matchScore: result.score,
    matchStrength: result.strength,
    matchReasons: result.reasons,
  });

  let actionPicks = unsaved;
  if (matchProfile.sector) {
    const sectorFit = unsaved.filter(({ result }) =>
      result.reasons.some((r) => r.label === "Sector"),
    );
    const general = unsaved.filter(
      ({ result }) => !result.reasons.some((r) => r.label === "Sector"),
    );
    const merged = [...sectorFit.slice(0, 4), ...general.slice(0, 2)];
    const seen = new Set(merged.map(({ o }) => o.id));
    for (const item of unsaved) {
      if (merged.length >= 6) break;
      if (!seen.has(item.o.id)) {
        merged.push(item);
        seen.add(item.o.id);
      }
    }
    actionPicks = merged;
  }

  const actionItems: RecommendedOpportunity[] = actionPicks.slice(0, 6).map(toRecommended);

  const newMatchedThisWeek = scored.filter(
    ({ o, result }) => newIds.has(o.id) && result.score >= MATCH_LIST_MIN_SCORE,
  ).length;

  const actionRecommendedCount = scored.filter(
    ({ o, result }) =>
      !savedOpportunityIds.has(o.id) &&
      newIds.has(o.id) &&
      result.score >= ACTION_RECOMMEND_MIN_SCORE,
  ).length;

  const toScoredMatch = ({ o, result }: (typeof scored)[number]): ScoredMatch => ({
    ...o,
    matchScore: result.score,
    matchStrength: result.strength,
    matchReasons: result.reasons,
    matchPenalties: result.penalties,
  });

  // Matches tab: all moderate-or-better fits (not a fixed top-50 slice)
  const allMatches: ScoredMatch[] = scored
    .filter(({ result }) => isModeratePlusMatch(result.score, result.strength))
    .map(toScoredMatch);

  // Keep incubatorMatches for backwards compat (overview only uses actionItems now)
  const incubatorMatches: ScoredMatch[] = scored
    .filter(({ o }) => /incubator|accelerator/i.test(o.category))
    .slice(0, 4)
    .map(toScoredMatch);

  const toDeadlineItem = ({ o, date }: { o: Opportunity; date: Date }): UpcomingDeadline => ({
    id: o.id,
    name: o.name,
    org: o.org,
    deadline: o.deadline,
    deadlineDate: date.toISOString(),
    daysUntil: Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    isSaved: savedOpportunityIds.has(o.id),
  });

  // All future fixed-date deadlines (rolling/TBA excluded by parseDeadline)
  const allFutureDeadlines = candidates
    .map((o) => ({ o, date: parseDeadline(o.deadline) }))
    .filter((x): x is { o: Opportunity; date: Date } => x.date !== null && x.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingDeadlines: UpcomingDeadline[] = allFutureDeadlines
    .slice(0, 5)
    .map(toDeadlineItem);

  const calendarDeadlines: UpcomingDeadline[] = allFutureDeadlines.map(toDeadlineItem);

  // Deadlines this week: saved opportunities with deadline in next 7 days
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const deadlinesThisWeek = allFutureDeadlines.filter(
    ({ o, date }) => savedOpportunityIds.has(o.id) && date <= nextWeek,
  ).length;

  const relevantMatchCount = allMatches.length;
  const goodPlusMatches = allMatches.filter((m) => m.matchScore >= FUNDING_ESTIMATE_MIN_SCORE);
  const fundingEstimateMatches = goodPlusMatches.slice(0, FUNDING_ESTIMATE_TOP_N);
  const { totalInr: potentialFundingInr, pricedCount: potentialFundingCount } =
    estimateFundingFromAmounts(fundingEstimateMatches.map((m) => m.amount));

  return {
    authenticated: true as const,
    name,
    profile: p,
    profileCompleteness,
    savedCount,
    appliedCount,
    totalCount: totalResult.count ?? 0,
    newThisWeekCount: newMatchedThisWeek,
    actionRecommendedCount,
    deadlinesThisWeek,
    actionItems,
    pipeline,
    incubatorMatches,
    allMatches,
    upcomingDeadlines,
    calendarDeadlines,
    potentialFundingInr,
    potentialFundingCount,
    relevantMatchCount,
    fundingEstimateSize: fundingEstimateMatches.length,
    goodPlusMatchCount: goodPlusMatches.length,
  };
});

export const loadSavedOpportunities = createServerFn({ method: "POST" }).handler(async () => {
  try {
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
  } catch (err) {
    console.error("loadSavedOpportunities failed:", err);
    throw err instanceof Error ? err : new Error("Failed to load saved opportunities");
  }
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
      return {
        ok: false as const,
        destination: "/login" as const,
        cookieHeaders: [] as [string, string][],
      };
    }

    const profile = await getProfile(sessionData.user.id);
    const destination = profile ? (data.next ?? "/dashboard") : "/onboarding";

    const cookieHeaders = getPending().map((c): [string, string] => [
      "Set-Cookie",
      serializeCookie(c.name, c.value, c.options),
    ]);

    return { ok: true as const, destination, cookieHeaders };
  });

export const completeLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { supabase, getPending } = createSupabaseSSRClient();
  await supabase.auth.signOut();

  const cookieHeaders = getPending().map((c): [string, string] => [
    "Set-Cookie",
    serializeCookie(c.name, c.value, c.options),
  ]);

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
        { user_id: user.id, opportunity_id: data.opportunityId, status: "saved" as const },
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
    const { data: updated, error } = await supabase
      .from("saved_opportunities")
      .update({ status: data.status })
      .eq("user_id", user.id)
      .eq("opportunity_id", data.opportunityId)
      .select("opportunity_id")
      .maybeSingle();
    if (error) {
      if (/column.*status|status.*does not exist/i.test(error.message)) {
        throw new Error(
          "Pipeline status column missing. Run scripts/apply-missing-schema.sql in Supabase SQL Editor.",
        );
      }
      throw new Error(error.message);
    }
    if (!updated) throw new Error("Saved opportunity not found");
    return { ok: true as const };
  });

const liveMatchInputSchema = z.object({
  stage: z.string().optional(),
  sector: z.string().optional(),
  fundingStatus: z.string().optional(),
  location: z.string().optional(),
  teamSize: z.coerce.number().int().min(1).max(9999).optional(),
  fundingRaised: z.string().optional(),
  incorporated: z.boolean().optional(),
  dpiitRecognized: z.boolean().optional(),
  womenLed: z.boolean().optional(),
  studentLed: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).default(50),
});

function toScoredMatchFromRanked(
  r: ReturnType<typeof rankOpportunities>[number],
): ScoredMatch {
  return {
    id: r.id,
    name: r.name,
    org: r.org,
    short: r.short,
    description: r.description,
    category: r.category,
    industry: r.industry,
    stage: r.stage,
    location: r.location,
    amount: r.amount,
    deadline: r.deadline,
    eligibility: r.eligibility,
    logo: r.logo,
    sourceUrl: r.sourceUrl,
    tags: r.tags,
    matchScore: r.score,
    matchStrength: r.strength,
    matchReasons: r.reasons,
    matchPenalties: r.penalties,
  };
}

async function scoreLiveMatches(data: z.infer<typeof liveMatchInputSchema>): Promise<ScoredMatch[]> {
  if (!data.sector && !data.stage) return [];

  const profile: MatchableProfile = {
    stage: data.stage ?? null,
    sector: data.sector ?? null,
    location: data.location ?? null,
    funding_status: data.fundingStatus ?? null,
    funding_raised: data.fundingRaised ?? null,
    team_size: data.teamSize ?? null,
    dpiit_recognized: data.dpiitRecognized ?? false,
    incorporated: data.incorporated ?? false,
    women_led: data.womenLed ?? false,
    student_led: data.studentLed ?? false,
  };

  if (!isSupabaseConfigured()) {
    const { seedOpportunities } = await import("../opportunities");
    return rankOpportunities(profile, seedOpportunities, new Set(), data.limit).map(
      toScoredMatchFromRanked,
    );
  }

  const supabase = getSupabaseAdmin();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: rows, error }, { data: newRows }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(500),
    supabase
      .from("opportunities")
      .select("id")
      .eq("status", "published")
      .gte("published_at", sevenDaysAgo)
      .limit(200),
  ]);
  if (error) throw new Error(error.message);

  const newIds = new Set((newRows ?? []).map((r) => r.id as string));
  const candidates = (rows ?? []).map((r) => toOpportunity(r as DbOpportunity));
  return rankOpportunities(profile, candidates, newIds, data.limit).map(toScoredMatchFromRanked);
}

/** Live-scored matches for the Matches tab — updates as profile signals change. */
export const previewMatchRecommendations = createServerFn({ method: "POST" })
  .inputValidator(liveMatchInputSchema)
  .handler(async ({ data }) => {
    const items = await scoreLiveMatches(data);
    return { items };
  });

export const upsertProfile = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      stage: z.string().min(1),
      sector: z.string().min(1),
      fundingStatus: z.string().min(1),
      startupName: z.string().optional(),
      location: z.string().optional(),
      teamSize: z.coerce.number().int().min(1).max(9999).optional(),
      fundingRaised: z.string().optional(),
      incorporated: z.boolean().optional(),
      dpiitRecognized: z.boolean().optional(),
      womenLed: z.boolean().optional(),
      studentLed: z.boolean().optional(),
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
      startup_name: data.startupName ?? null,
      location: data.location ?? null,
      team_size: data.teamSize ?? null,
      funding_raised: data.fundingRaised ?? null,
      incorporated: data.incorporated ?? false,
      dpiit_recognized: data.dpiitRecognized ?? false,
      women_led: data.womenLed ?? false,
      student_led: data.studentLed ?? false,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
