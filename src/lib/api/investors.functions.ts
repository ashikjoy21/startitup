import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";
import type {
  FundingRoundListItem,
  InvestorDetail,
  InvestorListItem,
  PortfolioStartup,
  StartupDetail,
  StartupListItem,
} from "../investors.types";

const listFiltersSchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  stage: z.string().optional(),
  limit: z.number().int().min(1).max(5000).default(24),
  offset: z.number().int().min(0).default(0),
});

const fundingFiltersSchema = z.object({
  q: z.string().optional(),
  round_type: z.string().optional(),
  limit: z.number().int().min(1).max(5000).default(24),
  offset: z.number().int().min(0).default(0),
});

const startupFiltersSchema = z.object({
  q: z.string().optional(),
  sector: z.string().optional(),
  limit: z.number().int().min(1).max(5000).default(24),
  offset: z.number().int().min(0).default(0),
});

function filterInvestors(items: InvestorListItem[], filters: z.infer<typeof listFiltersSchema>) {
  let out = items;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    out = out.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.sector_focus.some((s) => s.toLowerCase().includes(q)) ||
        (i.location?.toLowerCase().includes(q) ?? false),
    );
  }
  if (filters.type && filters.type !== "All") {
    out = out.filter((i) => i.type === filters.type);
  }
  if (filters.stage && filters.stage !== "All") {
    const stage = filters.stage.toLowerCase();
    out = out.filter((i) =>
      i.investment_stages.some((s) => s.toLowerCase().includes(stage)),
    );
  }
  return out;
}

function filterStartups(items: StartupListItem[], filters: z.infer<typeof startupFiltersSchema>) {
  let out = items;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    out = out.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.sector?.toLowerCase().includes(q) ?? false) ||
        (s.location?.toLowerCase().includes(q) ?? false) ||
        (s.description?.toLowerCase().includes(q) ?? false),
    );
  }
  if (filters.sector && filters.sector !== "All") {
    out = out.filter((s) => (s.sector?.trim() || "Technology") === filters.sector);
  }
  return out;
}

function filterFunding(items: FundingRoundListItem[], filters: z.infer<typeof fundingFiltersSchema>) {
  let out = items;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    out = out.filter(
      (r) =>
        r.startup_name.toLowerCase().includes(q) ||
        r.investors.some((n) => n.toLowerCase().includes(q)) ||
        (r.amount_text?.toLowerCase().includes(q) ?? false),
    );
  }
  if (filters.round_type && filters.round_type !== "All") {
    out = out.filter((r) => r.round_type === filters.round_type);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Supabase loader — fetches all ecosystem data and assembles into typed maps
// ---------------------------------------------------------------------------

async function loadData() {
  const db = getSupabaseAdmin();

  const [
    { data: investorsRaw, error: e1 },
    { data: roundsRaw, error: e2 },
    { data: isrRaw, error: e3 },
  ] = await Promise.all([
    db
      .from("investors")
      .select("id,name,type,website,linkedin,location,investment_stages,sector_focus,portfolio_count")
      .limit(5000),
    db
      .from("funding_rounds")
      .select("id,startup_id,round_type,amount_inr,amount_usd,amount_text,announced_date,source_url")
      .limit(5000),
    db
      .from("investor_startup_relationships")
      .select("investor_id,startup_id,funding_round_id")
      .limit(10000),
  ]);

  if (e1) throw new Error(`investors: ${e1.message}`);
  if (e2) throw new Error(`funding_rounds: ${e2.message}`);
  if (e3) throw new Error(`investor_startup_relationships: ${e3.message}`);

  // Fetch only startups that appear in funding rounds
  const fundedIds = [...new Set((roundsRaw ?? []).map((r) => r.startup_id))];
  const { data: startupsRaw, error: e4 } = await db
    .from("startups")
    .select(
      "id,name,sector,sector_verified,sector_source,sector_evidence_url,website,location,state,founding_year",
    )
    .in("id", fundedIds.length ? fundedIds : ["__none__"])
    .limit(5000);
  if (e4) throw new Error(`startups: ${e4.message}`);

  // O(1) lookup maps
  const startupMap = new Map((startupsRaw ?? []).map((s) => [s.id, s]));
  const investorNameMap = new Map((investorsRaw ?? []).map((i) => [i.id, i.name]));

  // round_id → investor names[], investor_id → portfolio startups[]
  const investorsByRound = new Map<string, string[]>();
  const portfolioMap = new Map<string, PortfolioStartup[]>();

  for (const rel of isrRaw ?? []) {
    if (rel.funding_round_id) {
      const arr = investorsByRound.get(rel.funding_round_id) ?? [];
      const name = investorNameMap.get(rel.investor_id);
      if (name && !arr.includes(name)) arr.push(name);
      investorsByRound.set(rel.funding_round_id, arr);
    }
    const s = startupMap.get(rel.startup_id);
    if (s) {
      const arr = portfolioMap.get(rel.investor_id) ?? [];
      if (!arr.some((p) => p.id === s.id)) {
        arr.push({
          id: s.id,
          name: s.name,
          sector: s.sector ?? null,
          sector_verified: s.sector_verified ?? false,
          sector_source: (s.sector_source as PortfolioStartup["sector_source"]) ?? undefined,
          sector_evidence_url: s.sector_evidence_url ?? null,
        });
      }
      portfolioMap.set(rel.investor_id, arr);
    }
  }

  // Funding rounds with startup context + investor names
  const funding_rounds: FundingRoundListItem[] = (roundsRaw ?? []).map((r) => {
    const s = startupMap.get(r.startup_id);
    return {
      id: r.id,
      startup_id: r.startup_id,
      startup_name: s?.name ?? "",
      startup_sector: s?.sector ?? null,
      startup_sector_verified: s?.sector_verified ?? false,
      startup_sector_source:
        (s?.sector_source as FundingRoundListItem["startup_sector_source"]) ?? undefined,
      startup_sector_evidence_url: s?.sector_evidence_url ?? null,
      round_type: r.round_type,
      amount_text: r.amount_text ?? null,
      amount_usd: r.amount_usd ?? null,
      announced_date: r.announced_date ?? null,
      source_url: r.source_url,
      investors: investorsByRound.get(r.id) ?? [],
    };
  });

  // Compute funding_round_count and latest_round_date per startup
  const roundCountMap = new Map<string, number>();
  const latestDateMap = new Map<string, string>();
  for (const r of roundsRaw ?? []) {
    roundCountMap.set(r.startup_id, (roundCountMap.get(r.startup_id) ?? 0) + 1);
    if (r.announced_date) {
      const prev = latestDateMap.get(r.startup_id) ?? "";
      if (r.announced_date > prev) latestDateMap.set(r.startup_id, r.announced_date);
    }
  }

  const funded_startups: StartupListItem[] = (startupsRaw ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    sector: s.sector ?? null,
    sector_verified: s.sector_verified ?? false,
    sector_source: (s.sector_source as StartupListItem["sector_source"]) ?? undefined,
    sector_evidence_url: s.sector_evidence_url ?? null,
    website: s.website ?? null,
    location: s.location ?? null,
    state: s.state ?? null,
    founding_year: s.founding_year ?? null,
    funding_round_count: roundCountMap.get(s.id) ?? 0,
    latest_round_date: latestDateMap.get(s.id) ?? null,
  }));

  const investors = (investorsRaw ?? []) as InvestorListItem[];

  return { investors, funding_rounds, funded_startups, portfolioMap };
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

export const getInvestorMeta = createServerFn({ method: "GET" }).handler(async () => {
  const db = getSupabaseAdmin();
  const [{ count: investors }, { count: funding_rounds }, { count: funded_startups }] =
    await Promise.all([
      db.from("investors").select("id", { count: "exact", head: true }),
      db.from("funding_rounds").select("id", { count: "exact", head: true }),
      db
        .from("startups")
        .select("id", { count: "exact", head: true })
        .gt("id", ""), // all rows
    ]);
  return {
    built_at: new Date().toISOString(),
    counts: {
      investors: investors ?? 0,
      funding_rounds: funding_rounds ?? 0,
      funded_startups: funded_startups ?? 0,
      startups: funded_startups ?? 0,
    },
    source: "supabase" as const,
  };
});

export const listInvestors = createServerFn({ method: "GET" })
  .inputValidator(listFiltersSchema)
  .handler(async ({ data }) => {
    const { investors } = await loadData();
    const filtered = filterInvestors(investors, data);
    return {
      items: filtered.slice(data.offset, data.offset + data.limit),
      total: filtered.length,
      source: "supabase" as const,
    };
  });

export const getInvestorById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { investors, funding_rounds, portfolioMap } = await loadData();
    const investor = investors.find((i) => i.id === data.id);
    if (!investor) throw new Error("Investor not found");

    const portfolio = portfolioMap.get(data.id) ?? [];
    const derived_sector_focus = [
      ...new Set(portfolio.map((s) => s.sector).filter((s): s is string => Boolean(s))),
    ].sort((a, b) => a.localeCompare(b));

    const sectorCounts = new Map<string, number>();
    for (const s of portfolio) {
      const key = s.sector?.trim() || "Technology";
      sectorCounts.set(key, (sectorCounts.get(key) ?? 0) + 1);
    }
    const sector_breakdown = [...sectorCounts.entries()]
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => b.count - a.count || a.sector.localeCompare(b.sector));

    const recent_rounds = funding_rounds
      .filter((r) => r.investors.some((n) => n.toLowerCase() === investor.name.toLowerCase()))
      .slice(0, 20);

    const detail: InvestorDetail = {
      ...investor,
      sector_focus:
        investor.sector_focus.length > 0 ? investor.sector_focus : derived_sector_focus.slice(0, 12),
      portfolio,
      recent_rounds,
      derived_sector_focus,
      sector_breakdown,
    };
    return { investor: detail, source: "supabase" as const };
  });

export const listFundingRounds = createServerFn({ method: "GET" })
  .inputValidator(fundingFiltersSchema)
  .handler(async ({ data }) => {
    const { funding_rounds } = await loadData();
    const filtered = filterFunding(funding_rounds, data);
    return {
      items: filtered.slice(data.offset, data.offset + data.limit),
      total: filtered.length,
      source: "supabase" as const,
    };
  });

export const getFundingRoundById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { funding_rounds } = await loadData();
    const round = funding_rounds.find((r) => r.id === data.id);
    if (!round) throw new Error("Funding round not found");
    return { round, source: "supabase" as const };
  });

export const listFundedStartups = createServerFn({ method: "GET" })
  .inputValidator(startupFiltersSchema)
  .handler(async ({ data }) => {
    const { funded_startups } = await loadData();
    const filtered = filterStartups(funded_startups, data);
    return {
      items: filtered.slice(data.offset, data.offset + data.limit),
      total: filtered.length,
      source: "supabase" as const,
    };
  });

export const getStartupById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { funded_startups, funding_rounds } = await loadData();
    const startup = funded_startups.find((s) => s.id === data.id);
    if (!startup) throw new Error("Startup not found");

    const rounds = funding_rounds.filter((r) => r.startup_id === data.id);
    const investorNames = new Set<string>();
    for (const r of rounds) {
      for (const n of r.investors) investorNames.add(n);
    }

    const detail: StartupDetail = {
      ...startup,
      state: startup.state ?? null,
      founding_year: startup.founding_year ?? null,
      funding_rounds: rounds,
      investors: [...investorNames].sort((a, b) => a.localeCompare(b)),
    };
    return { startup: detail, source: "supabase" as const };
  });

export const getStartupFilterOptions = createServerFn({ method: "GET" }).handler(async () => {
  const { funded_startups } = await loadData();
  const sectors = [
    ...new Set(funded_startups.map((s) => s.sector?.trim() || "Technology").filter(Boolean)),
  ].sort();
  return { sectors };
});

export const getInvestorFilterOptions = createServerFn({ method: "GET" }).handler(async () => {
  const { investors, funding_rounds } = await loadData();
  const types = [...new Set(investors.map((i) => i.type))].sort();
  const stages = [
    ...new Set(investors.flatMap((i) => i.investment_stages).filter(Boolean)),
  ].sort();
  const roundTypes = [...new Set(funding_rounds.map((r) => r.round_type))].sort();
  return { types, stages, roundTypes };
});
