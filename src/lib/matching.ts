import type { Opportunity } from "./opportunities";
import {
  isPanIndiaOpportunityLocation,
  normalizeIndianState,
  parseProfileLocation,
  resolveStateFromOpportunityLocation,
} from "./location-options";
import { effectiveIndustry, effectiveTags } from "./opportunity-inference";

export type MatchStrength = "excellent" | "strong" | "good" | "moderate" | "weak";

export type MatchReason = { label: string; detail: string };

export type MatchResult = {
  score: number; // 0–100
  strength: MatchStrength;
  reasons: MatchReason[];
  penalties: MatchReason[];
};

export interface MatchableProfile {
  stage: string | null;
  sector: string | null;
  location: string | null;
  funding_status: string | null;
  funding_raised: string | null;
  team_size: number | null;
  dpiit_recognized: boolean;
  incorporated: boolean;
  women_led: boolean;
  student_led: boolean;
}

const PROFILE_SECTOR_TO_TAGS: Record<string, string[]> = {
  agritech: ["agritech"],
  "climate/cleantech": ["cleantech"],
  "d2c/ecommerce": ["d2c"],
  "deeptech/ai": ["deeptech", "saas"],
  edtech: ["edtech"],
  fintech: ["fintech"],
  gaming: ["gaming"],
  healthtech: ["healthtech"],
  "media/creator": ["media"],
  mobility: ["mobility"],
  "saas/b2b": ["saas"],
  "social impact": ["social"],
  spacetech: ["spacetech"],
  web3: ["web3"],
  biotech: ["biotech"],
};

// ─── Stage ────────────────────────────────────────────────────────────────────

// Space-normalised (hyphens → spaces, lower). Every value that can appear in
// profile OR opportunity stages must appear here or in STAGE_ALIASES.
const STAGE_ORDER = ["pre seed", "seed", "series a", "series b", "series c", "growth"];

// Normalise a raw stage string: lower, non-alpha → space, collapse spaces.
function normaliseStage(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Maps normalised profile / opportunity stage labels to STAGE_ORDER entries.
const STAGE_ALIASES: Record<string, string> = {
  // Profile page stage dropdown
  idea: "pre seed",
  mvp: "pre seed",
  "early traction": "seed",
  growth: "growth",
  "series a ": "series a", // trailing space from stripping "+"
  "series b ": "series b",
  // Funding status dropdown (used as fallback)
  bootstrapped: "pre seed",
  "pre seed": "pre seed", // normalised "pre-seed"
  seed: "seed",
  "series a": "series a",
  "series b": "series b",
  // Opportunity stage values
  "early revenue": "seed",
  "early stage": "pre seed",
  "pre revenue": "pre seed",
  "any stage": "seed", // treated as mid-range
};

function resolveStage(raw: string): string {
  const n = normaliseStage(raw);
  return STAGE_ALIASES[n] ?? n;
}

function stageScore(profileStage: string, oppStage: string): { pts: number; label: string | null } {
  const os = normaliseStage(oppStage);
  if (os === "any" || os === "all") return { pts: 8, label: "Open to all stages" };

  const ps = resolveStage(profileStage);
  const resolvedOs = STAGE_ALIASES[os] ?? os;

  const pi = STAGE_ORDER.indexOf(ps);
  const oi = STAGE_ORDER.indexOf(resolvedOs);

  if (pi < 0 || oi < 0) {
    // Last-resort substring match
    if (resolvedOs.includes(ps) || ps.includes(resolvedOs)) return { pts: 18, label: `${oppStage} — fits` };
    return { pts: 0, label: null };
  }

  const dist = Math.abs(pi - oi);
  if (dist === 0) return { pts: 25, label: `${oppStage} — exact stage` };
  if (dist === 1) return { pts: 14, label: `${oppStage} — adjacent stage` };
  if (dist === 2) return { pts: 5, label: `${oppStage} — nearby stage` };
  return { pts: 0, label: null };
}

// ─── Sector ───────────────────────────────────────────────────────────────────

const SECTOR_GROUPS: string[][] = [
  ["saas", "software", "b2b software", "enterprise software", "cloud", "api", "b2b"],
  ["ai", "artificial intelligence", "machine learning", "ml", "deep learning", "genai", "llm", "nlp"],
  ["fintech", "finance", "banking", "payments", "insurance", "insurtech", "wealthtech"],
  ["healthtech", "health", "medtech", "medical", "healthcare"],
  ["biotech", "pharma", "life sciences", "lifesciences", "biosciences"],
  ["edtech", "education", "learning", "e-learning", "skill"],
  ["deep tech", "deeptech", "hardware", "semiconductor", "robotics", "quantum", "photonics"],
  ["cleantech", "climate", "energy", "renewable", "sustainability", "greentech", "solar"],
  ["agritech", "agriculture", "farming", "food tech", "foodtech"],
  ["ecommerce", "e-commerce", "retail", "d2c", "consumer"],
  ["logistics", "supply chain", "fulfillment", "last-mile", "shipping"],
  ["cybersecurity", "security", "infosec"],
  ["spacetech", "space", "drone", "uav"],
  ["gaming", "game", "esports"],
  ["web3", "blockchain", "crypto"],
  ["mobility", "transport", "automotive", "ev"],
  ["media", "creator", "content"],
  ["social impact", "social", "ngo", "impact"],
];

// Profile page sector dropdown → canonical tokens
const PROFILE_SECTOR_ALIASES: Record<string, string[]> = {
  agritech: ["agritech", "agriculture", "farming"],
  "climate/cleantech": ["cleantech", "climate", "energy", "renewable"],
  "d2c/ecommerce": ["d2c", "ecommerce", "consumer", "retail"],
  "deeptech/ai": ["deeptech", "deep tech", "ai", "ml", "machine learning"],
  edtech: ["edtech", "education"],
  fintech: ["fintech", "finance", "payments"],
  gaming: ["gaming", "game", "esports"],
  healthtech: ["healthtech", "health", "medtech", "medical"],
  "media/creator": ["media", "creator", "content"],
  mobility: ["mobility", "transport", "automotive", "ev"],
  "saas/b2b": ["saas", "b2b", "software", "cloud"],
  "social impact": ["social", "impact", "social impact"],
  spacetech: ["spacetech", "space", "drone"],
  web3: ["web3", "blockchain", "crypto"],
  // Fallback aliases used by older profiles
  "ai/ml": ["ai", "ml", "machine learning"],
  deeptech: ["deeptech", "deep tech", "hardware"],
  saas: ["saas", "software"],
  biotech: ["biotech", "pharma", "life sciences"],
  cleantech: ["cleantech", "climate", "energy"],
  consumer: ["consumer", "d2c", "retail"],
};

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[/,\s]+/).filter(Boolean);
}

function expandProfileSector(profileSector: string): string[] {
  const key = profileSector.toLowerCase().trim();
  const explicit = PROFILE_SECTOR_ALIASES[key];
  if (explicit) return [...new Set(explicit)];
  // Fallback: tokenise + fuzzy alias lookup
  const tokens = tokenize(profileSector);
  const extra = Object.entries(PROFILE_SECTOR_ALIASES)
    .filter(([k]) => tokens.some((t) => k.includes(t) || t.includes(k)))
    .flatMap(([, v]) => v);
  return [...new Set([...tokens, ...extra])];
}

/** Higher = more sector-specific (tie-breaker). */
export function industrySpecificity(industry: string): number {
  const oi = industry.toLowerCase().trim();
  if (!oi || oi === "all") return 0;
  return oi.split(/[/,]/).filter(Boolean).length + 1;
}

// Which SECTOR_GROUP index does a token list fall into? -1 = none.
function groupOf(tokens: string[]): number {
  for (let i = 0; i < SECTOR_GROUPS.length; i++) {
    const g = SECTOR_GROUPS[i];
    if (tokens.some((t) => g.some((s) => s.includes(t) || t.includes(s)))) return i;
  }
  return -1;
}

function sectorScore(
  profileSector: string,
  oppIndustry: string,
): { pts: number; label: string | null } {
  const oi = oppIndustry.toLowerCase().trim();

  // Generic — not a strong signal when the founder has a specific sector
  if (oi === "all") return { pts: 0, label: null };

  const profileTokens = expandProfileSector(profileSector);
  const oppTokens = tokenize(oppIndustry);

  // Direct token overlap (e.g. "saas" in profile tokens AND in opp tokens)
  const direct = profileTokens.some((p) => oppTokens.some((o) => o.includes(p) || p.includes(o)));
  if (direct) return { pts: 30, label: `${oppIndustry} — sector match` };

  // Same synonym group (e.g. "SaaS/B2B" profile, "Software" opp)
  const pg = groupOf(profileTokens);
  const og = groupOf(oppTokens);
  if (pg >= 0 && pg === og) return { pts: 22, label: `${oppIndustry} — related sector` };

  // Opp has a specific sector that explicitly doesn't match — small penalty
  return { pts: -5, label: null };
}

// ─── Location ─────────────────────────────────────────────────────────────────

function locationScore(
  profileLocation: string | null,
  oppLocation: string,
): { pts: number; reasons: MatchReason[]; penalties: MatchReason[] } {
  const reasons: MatchReason[] = [];
  const penalties: MatchReason[] = [];
  if (!profileLocation) return { pts: 0, reasons, penalties };

  const profile = parseProfileLocation(profileLocation);
  const ol = oppLocation.toLowerCase().trim();
  const oppState = resolveStateFromOpportunityLocation(oppLocation);
  const profileState = profile.state ? normalizeIndianState(profile.state) : null;

  if (/global|remote|worldwide|anywhere/i.test(ol)) {
    return {
      pts: 8,
      reasons: [{ label: "Location", detail: "Available globally" }],
      penalties,
    };
  }

  if (isPanIndiaOpportunityLocation(oppLocation) && profile.country === "India") {
    return {
      pts: 14,
      reasons: [{ label: "Location", detail: "India — eligible" }],
      penalties,
    };
  }

  if (oppState && profile.country === "India") {
    if (profileState && profileState === oppState) {
      return {
        pts: 26,
        reasons: [{ label: "Location", detail: `${oppState} — state match` }],
        penalties,
      };
    }
    if (profileState && profileState !== oppState) {
      return {
        pts: -14,
        reasons: [],
        penalties: [
          {
            label: "State only",
            detail: `${oppState} program — you're in ${profileState}`,
          },
        ],
      };
    }
    return {
      pts: 6,
      reasons: [{ label: "Location", detail: `${oppState} — select your state to verify` }],
      penalties,
    };
  }

  const pl = profileLocation.toLowerCase();
  const plTokens = pl.split(/[,\s/]+/).filter(Boolean);
  const olTokens = ol.split(/[/,\s]+/).filter(Boolean);
  if (plTokens.some((p) => olTokens.some((o) => o.includes(p) || p.includes(o)))) {
    return {
      pts: 22,
      reasons: [{ label: "Location", detail: `${oppLocation} — location match` }],
      penalties,
    };
  }

  if (/sea|asia/i.test(ol) && profile.country === "India") {
    return {
      pts: 8,
      reasons: [{ label: "Location", detail: `${oppLocation} — accessible` }],
      penalties,
    };
  }
  if (/remote.*sf|sf.*remote/i.test(ol)) {
    return {
      pts: 7,
      reasons: [{ label: "Location", detail: "Remote-friendly" }],
      penalties,
    };
  }

  if (profile.country !== "India") {
    const oppCountry = oppLocation.trim();
    if (oppCountry.toLowerCase() === profile.country.toLowerCase()) {
      return {
        pts: 18,
        reasons: [{ label: "Location", detail: `${profile.country} — eligible` }],
        penalties,
      };
    }
  }

  return { pts: 0, reasons, penalties };
}

// ─── Eligibility ──────────────────────────────────────────────────────────────

function eligibilityResult(
  profile: MatchableProfile,
  opp: Opportunity,
): { pts: number; reasons: MatchReason[]; penalties: MatchReason[] } {
  const reasons: MatchReason[] = [];
  const penalties: MatchReason[] = [];
  let pts = 0;

  const text = `${opp.eligibility} ${opp.description} ${opp.name}`.toLowerCase();
  const tags = effectiveTags(opp);

  // DPIIT — prefer structured tag; fall back to text parsing
  if (!tags.includes("dpiit-required") && /dpiit[- ]recogni[sz]ed|dpiit.registered/.test(text)) {
    if (profile.dpiit_recognized) {
      pts += 12;
      reasons.push({ label: "DPIIT eligible", detail: "DPIIT-recognized startup" });
    } else {
      pts -= 20;
      penalties.push({ label: "DPIIT required", detail: "Requires DPIIT recognition" });
    }
  }

  // Incorporation
  if (!tags.includes("incorporated-required") && /registered company|pvt\.? ltd|incorporated|legal entity/.test(text)) {
    if (profile.incorporated) {
      pts += 6;
      reasons.push({ label: "Incorporated", detail: "Registered company ✓" });
    } else {
      pts -= 6;
      penalties.push({ label: "Incorporation required", detail: "Must be a registered company" });
    }
  }

  // Biotech-specific programs: penalise non-biotech founders explicitly
  const isBiotechOpp = /birac|biotech|pharmaceutical|life science/i.test(
    `${opp.name} ${opp.org} ${opp.category}`,
  );
  const profileSector = (profile.sector ?? "").toLowerCase();
  const isBiotechProfile =
    profileSector.includes("biotech") ||
    profileSector.includes("health") ||
    profileSector.includes("pharma");
  if (isBiotechOpp && !isBiotechProfile) {
    pts -= 10;
    penalties.push({ label: "Sector mismatch", detail: "Biotech-specific program" });
  }

  // Funding-stage fit: heavy mismatch signal
  const profileStageIdx = STAGE_ORDER.indexOf(resolveStage(profile.stage ?? ""));
  const resolvedOppStage = resolveStage(opp.stage);
  const oppStageIdx = STAGE_ORDER.indexOf(resolvedOppStage);
  if (profileStageIdx >= 3 && oppStageIdx >= 0 && oppStageIdx <= 0) {
    // Later-stage founder targeting very early pre-seed grants
    pts -= 5;
  }

  return { pts, reasons, penalties };
}

// ─── Structured tags ────────────────────────────────────────────────────────────

function profileSectorTags(sector: string | null): Set<string> {
  if (!sector) return new Set();
  const key = sector.toLowerCase().trim();
  const mapped = PROFILE_SECTOR_TO_TAGS[key] ?? [];
  const tokens = sector.toLowerCase().split(/[/,\s]+/).filter(Boolean);
  return new Set([...mapped, ...tokens]);
}

function tagScore(
  profile: MatchableProfile,
  opp: Opportunity,
): { pts: number; reasons: MatchReason[]; penalties: MatchReason[] } {
  const tags = new Set(effectiveTags(opp));
  const reasons: MatchReason[] = [];
  const penalties: MatchReason[] = [];
  let pts = 0;

  if (tags.size === 0) return { pts, reasons, penalties };

  const sectorTags = profileSectorTags(profile.sector);
  if (sectorTags.size > 0) {
    const hits = [...tags].filter((t) => sectorTags.has(t));
    if (hits.length > 0) {
      pts += Math.min(18, hits.length * 9);
      reasons.push({ label: "Tags", detail: `Sector tags: ${hits.join(", ")}` });
    } else {
      const sectorOnly = [...tags].filter((t) =>
        ["saas", "fintech", "healthtech", "biotech", "deeptech", "agritech", "cleantech", "edtech", "spacetech", "gaming", "web3", "mobility", "d2c"].includes(t),
      );
      if (sectorOnly.length > 0) {
        pts -= 8;
        penalties.push({ label: "Sector tags", detail: `Targets ${sectorOnly.join(", ")}` });
      }
    }
  }

  if (tags.has("dpiit-required")) {
    if (profile.dpiit_recognized) {
      pts += 14;
      reasons.push({ label: "DPIIT", detail: "DPIIT-recognized startup" });
    } else {
      pts -= 22;
      penalties.push({ label: "DPIIT", detail: "Requires DPIIT recognition" });
    }
  }

  if (tags.has("incorporated-required")) {
    if (profile.incorporated) {
      pts += 7;
      reasons.push({ label: "Incorporated", detail: "Registered company ✓" });
    } else {
      pts -= 8;
      penalties.push({ label: "Incorporation", detail: "Must be incorporated" });
    }
  }

  if (tags.has("women-led")) {
    if (profile.women_led) {
      pts += 12;
      reasons.push({ label: "Women-led", detail: "Women entrepreneur program" });
    } else {
      pts -= 6;
      penalties.push({ label: "Women-led", detail: "Women-founder focused program" });
    }
  }

  if (tags.has("student-led")) {
    if (profile.student_led) {
      pts += 10;
      reasons.push({ label: "Student", detail: "Student / campus startup program" });
    } else {
      pts -= 5;
      penalties.push({ label: "Student", detail: "Student-founder focused program" });
    }
  }

  const ps = resolveStage(profile.stage || profile.funding_status || "");
  const pi = STAGE_ORDER.indexOf(ps);
  const stageTagMap: Record<string, string> = {
    "pre-seed": "pre seed",
    seed: "seed",
    "series-a": "series a",
    growth: "growth",
  };
  for (const [tag, stageVal] of Object.entries(stageTagMap)) {
    if (!tags.has(tag)) continue;
    const oi = STAGE_ORDER.indexOf(stageVal);
    if (pi >= 0 && oi >= 0 && Math.abs(pi - oi) <= 1) {
      pts += 6;
      reasons.push({ label: "Stage tag", detail: `${tag} program` });
      break;
    }
  }

  return { pts, reasons, penalties };
}

// ─── Funding raised ───────────────────────────────────────────────────────────

function fundingRaisedScore(
  fundingRaised: string | null,
  oppStage: string,
): { pts: number; label: string | null } {
  if (!fundingRaised) return { pts: 0, label: null };

  const fr = fundingRaised.toLowerCase();
  const os = resolveStage(oppStage);
  const oppNorm = normaliseStage(oppStage);

  if (fr.includes("none") || fr.includes("under")) {
    if (os === "pre seed" || oppNorm === "any")
      return { pts: 8, label: "Early-stage program fits your raise" };
  }
  if (fr.includes("10l") || fr.includes("50l") || fr.includes("1cr")) {
    if (os === "seed" || os === "pre seed")
      return { pts: 6, label: "Funding range aligns with program" };
  }
  if (fr.includes("5cr") || fr.includes("cr+")) {
    if (os === "series a" || os === "series b")
      return { pts: 6, label: "Growth-stage program fits your raise" };
  }

  return { pts: 0, label: null };
}

// ─── Team size ────────────────────────────────────────────────────────────────

function teamSizeScore(
  teamSize: number | null,
  opp: Opportunity,
): { pts: number; label: string | null } {
  if (teamSize == null) return { pts: 0, label: null };

  const text = `${opp.eligibility} ${opp.description}`.toLowerCase();

  if (teamSize === 1 && /solo founder|single founder|individual entrepreneur/i.test(text)) {
    return { pts: 5, label: "Solo-founder friendly" };
  }
  if (teamSize >= 2 && teamSize <= 10 && /team of|2-10|small team|co-founder/i.test(text)) {
    return { pts: 4, label: "Team size eligible" };
  }
  if (teamSize > 50 && /large team|enterprise|scale-up/i.test(text)) {
    return { pts: 4, label: "Scale-up program" };
  }

  return { pts: 0, label: null };
}

// ─── Main scorer ──────────────────────────────────────────────────────────────

// Max achievable (no penalties): sector + stage + loc + tags + extras
const MAX_RAW = 130;

/** Minimum score (0–100) to appear on the Matches tab. */
export const MATCH_LIST_MIN_SCORE = 18;

const MODERATE_PLUS_STRENGTHS = new Set<MatchStrength>([
  "moderate",
  "good",
  "strong",
  "excellent",
]);

export function isModeratePlusMatch(
  score: number,
  strength: MatchStrength,
): boolean {
  return score >= MATCH_LIST_MIN_SCORE && MODERATE_PLUS_STRENGTHS.has(strength);
}

/** Minimum score (0–100) to count as an actionable recommendation. */
export const ACTION_RECOMMEND_MIN_SCORE = 38;

/** Good+ matches used for the dashboard funding estimate. */
export const FUNDING_ESTIMATE_MIN_SCORE = ACTION_RECOMMEND_MIN_SCORE;

/** How many top-scored programs to include (you won't apply to hundreds). */
export const FUNDING_ESTIMATE_TOP_N = 30;

/** Score many opportunities for a profile — used for live previews and dashboard. */
export function rankOpportunities(
  profile: MatchableProfile,
  opportunities: Opportunity[],
  newIds = new Set<string>(),
  limit = 6,
): Array<Opportunity & MatchResult> {
  const scored = opportunities.map((o) => ({
    ...o,
    ...scoreOpportunity(profile, o, newIds.has(o.id)),
  }));
  scored.sort((a, b) => {
    const diff = b.score - a.score;
    if (diff !== 0) return diff;
    return industrySpecificity(b.industry) - industrySpecificity(a.industry);
  });
  return scored.slice(0, limit);
}

export function scoreOpportunity(
  profile: MatchableProfile,
  opp: Opportunity,
  isNew = false,
): MatchResult {
  const reasons: MatchReason[] = [];
  const penalties: MatchReason[] = [];
  let raw = 0;

  // Stage — uses funding_status as fallback when stage is null
  const effectiveStage = profile.stage || profile.funding_status || "";
  if (effectiveStage) {
    const { pts, label } = stageScore(effectiveStage, opp.stage);
    raw += pts;
    if (label) reasons.push({ label: "Stage", detail: label });
  }

  // Sector — uses inferred industry when DB still says "All"
  if (profile.sector) {
    const industry = effectiveIndustry(opp);
    const { pts, label } = sectorScore(profile.sector, industry);
    raw += pts;
    if (label) reasons.push({ label: "Sector", detail: label });
  }

  // Structured tags (persisted + inferred)
  const tagResult = tagScore(profile, opp);
  raw += tagResult.pts;
  reasons.push(...tagResult.reasons);
  penalties.push(...tagResult.penalties);

  // Location (country + state-aware)
  const loc = locationScore(profile.location, opp.location);
  raw += loc.pts;
  reasons.push(...loc.reasons);
  penalties.push(...loc.penalties);

  // Eligibility (may add or subtract)
  const elig = eligibilityResult(profile, opp);
  raw += elig.pts;
  reasons.push(...elig.reasons);
  penalties.push(...elig.penalties);

  // Funding raised
  const { pts: frPts, label: frLabel } = fundingRaisedScore(profile.funding_raised, opp.stage);
  raw += frPts;
  if (frLabel) reasons.push({ label: "Funding", detail: frLabel });

  // Team size
  const { pts: teamPts, label: teamLabel } = teamSizeScore(profile.team_size, opp);
  raw += teamPts;
  if (teamLabel) reasons.push({ label: "Team", detail: teamLabel });

  // Recency boost
  if (isNew) {
    raw += 3;
    reasons.push({ label: "New", detail: "Added this week" });
  }

  // Has apply URL
  if (opp.sourceUrl) raw += 2;

  const clamped = Math.max(0, Math.min(MAX_RAW, raw));
  const score = Math.round((clamped / MAX_RAW) * 100);

  let strength: MatchStrength;
  if (score >= 78) strength = "excellent";
  else if (score >= 58) strength = "strong";
  else if (score >= 38) strength = "good";
  else if (score >= 18) strength = "moderate";
  else strength = "weak";

  return { score, strength, reasons, penalties };
}

export const STRENGTH_LABEL: Record<MatchStrength, string> = {
  excellent: "Excellent Match",
  strong: "Strong Match",
  good: "Good Match",
  moderate: "Moderate Match",
  weak: "Weak Match",
};

export const STRENGTH_COLOR: Record<MatchStrength, string> = {
  excellent: "text-emerald-600",
  strong: "text-teal-600",
  good: "text-blue-600",
  moderate: "text-amber-600",
  weak: "text-muted-foreground",
};

export const STRENGTH_BG: Record<MatchStrength, string> = {
  excellent: "bg-emerald-50 border-emerald-200",
  strong: "bg-teal-50 border-teal-200",
  good: "bg-blue-50 border-blue-200",
  moderate: "bg-amber-50 border-amber-200",
  weak: "bg-muted border-border",
};
