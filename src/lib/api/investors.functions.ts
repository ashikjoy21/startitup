import { createServerFn } from "@tanstack/react-start";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type {
  FundingRoundListItem,
  InvestorDetail,
  InvestorListItem,
  InvestorUiBundle,
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

let bundleCache: InvestorUiBundle | null = null;

function loadBundle(): InvestorUiBundle {
  if (bundleCache) return bundleCache;
  const path = join(process.cwd(), "data/investor-ecosystem/ui-bundle.json");
  if (!existsSync(path)) {
    throw new Error(
      "Investor data not built. Run: npm run investors:enrich && npm run investors:ui",
    );
  }
  bundleCache = JSON.parse(readFileSync(path, "utf8")) as InvestorUiBundle;
  if (!bundleCache.funded_startups) bundleCache.funded_startups = [];
  return bundleCache;
}

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

export const getInvestorMeta = createServerFn({ method: "GET" }).handler(async () => {
  const bundle = loadBundle();
  return {
    built_at: bundle.built_at,
    counts: bundle.counts,
    source: "local" as const,
  };
});

export const listInvestors = createServerFn({ method: "GET" })
  .inputValidator(listFiltersSchema)
  .handler(async ({ data }) => {
    const bundle = loadBundle();
    const filtered = filterInvestors(bundle.investors, data);
    return {
      items: filtered.slice(data.offset, data.offset + data.limit),
      total: filtered.length,
      source: "local" as const,
    };
  });

export const getInvestorById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const bundle = loadBundle();
    const investor = bundle.investors.find((i) => i.id === data.id);
    if (!investor) throw new Error("Investor not found");

    const portfolio = bundle.portfolios[data.id] ?? [];
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

    const recent_rounds = bundle.funding_rounds
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
    return { investor: detail, source: "local" as const };
  });

export const listFundingRounds = createServerFn({ method: "GET" })
  .inputValidator(fundingFiltersSchema)
  .handler(async ({ data }) => {
    const bundle = loadBundle();
    const filtered = filterFunding(bundle.funding_rounds, data);
    return {
      items: filtered.slice(data.offset, data.offset + data.limit),
      total: filtered.length,
      source: "local" as const,
    };
  });

export const getFundingRoundById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const bundle = loadBundle();
    const round = bundle.funding_rounds.find((r) => r.id === data.id);
    if (!round) throw new Error("Funding round not found");
    return { round, source: "local" as const };
  });

export const listFundedStartups = createServerFn({ method: "GET" })
  .inputValidator(startupFiltersSchema)
  .handler(async ({ data }) => {
    const bundle = loadBundle();
    const items = bundle.funded_startups ?? [];
    const filtered = filterStartups(items, data);
    return {
      items: filtered.slice(data.offset, data.offset + data.limit),
      total: filtered.length,
      source: "local" as const,
    };
  });

export const getStartupById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const bundle = loadBundle();
    const startup = (bundle.funded_startups ?? []).find((s) => s.id === data.id);
    if (!startup) throw new Error("Startup not found");

    const funding_rounds = bundle.funding_rounds.filter((r) => r.startup_id === data.id);
    const investorNames = new Set<string>();
    for (const r of funding_rounds) {
      for (const n of r.investors) investorNames.add(n);
    }

    const detail: StartupDetail = {
      ...startup,
      state: startup.state ?? null,
      founding_year: startup.founding_year ?? null,
      funding_rounds,
      investors: [...investorNames].sort((a, b) => a.localeCompare(b)),
    };
    return { startup: detail, source: "local" as const };
  });

export const getStartupFilterOptions = createServerFn({ method: "GET" }).handler(async () => {
  const bundle = loadBundle();
  const sectors = [
    ...new Set(
      (bundle.funded_startups ?? [])
        .map((s) => s.sector?.trim() || "Technology")
        .filter(Boolean),
    ),
  ].sort();
  return { sectors };
});

export const getInvestorFilterOptions = createServerFn({ method: "GET" }).handler(async () => {
  const bundle = loadBundle();
  const types = [...new Set(bundle.investors.map((i) => i.type))].sort();
  const stages = [
    ...new Set(bundle.investors.flatMap((i) => i.investment_stages).filter(Boolean)),
  ].sort();
  const roundTypes = [...new Set(bundle.funding_rounds.map((r) => r.round_type))].sort();
  return { types, stages, roundTypes };
});
