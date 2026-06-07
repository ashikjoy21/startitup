/**
 * Infer structured industry labels and matching tags from opportunity text.
 * Used at runtime (fallback) and by scripts/enrich-opportunity-tags.ts (persist).
 */

export type InferInput = {
  name: string;
  org: string;
  category: string;
  industry: string;
  stage: string;
  location: string;
  description: string;
  eligibility: string;
  tags?: string[];
};

export type InferredMeta = {
  industry: string;
  tags: string[];
};

type Rule = { label: string; weight: number; patterns: RegExp[] };

const INDUSTRY_RULES: Rule[] = [
  { label: "Biotech", weight: 3, patterns: [/biotech/i, /birac/i, /pharma/i, /life.?science/i, /bioscience/i] },
  { label: "HealthTech", weight: 3, patterns: [/healthtech/i, /health.?tech/i, /medtech/i, /medical device/i, /healthcare/i] },
  { label: "AI/ML", weight: 3, patterns: [/\bai\/ml\b/i, /artificial intelligence/i, /machine learning/i, /\bgenai\b/i, /\bllm\b/i, /deep learning/i] },
  { label: "Deep Tech", weight: 2, patterns: [/deep.?tech/i, /semiconductor/i, /robotics/i, /quantum/i, /hardware/i] },
  { label: "FinTech", weight: 3, patterns: [/fintech/i, /finance/i, /banking/i, /payments/i, /insurtech/i] },
  { label: "SaaS", weight: 3, patterns: [/\bsaas\b/i, /software/i, /\bb2b\b/i, /cloud platform/i, /aws activate/i, /microsoft for startups/i] },
  { label: "EdTech", weight: 2, patterns: [/edtech/i, /education/i, /e-learning/i, /learning platform/i] },
  { label: "AgriTech", weight: 3, patterns: [/agritech/i, /agriculture/i, /farming/i, /food.?tech/i] },
  { label: "CleanTech", weight: 3, patterns: [/cleantech/i, /climate/i, /renewable/i, /solar/i, /green.?tech/i, /sustainability/i] },
  { label: "Spacetech", weight: 3, patterns: [/spacetech/i, /space tech/i, /aerospace/i, /satellite/i] },
  { label: "Mobility", weight: 2, patterns: [/mobility/i, /transport/i, /automotive/i, /\bev\b/i, /logistics/i] },
  { label: "Gaming", weight: 3, patterns: [/gaming/i, /game dev/i, /esports/i] },
  { label: "Web3", weight: 3, patterns: [/web3/i, /blockchain/i, /crypto/i, /defi/i] },
  { label: "D2C", weight: 2, patterns: [/\bd2c\b/i, /direct.to.consumer/i, /ecommerce/i, /e-commerce/i] },
  { label: "Social Impact", weight: 2, patterns: [/social impact/i, /nonprofit/i, /ngo/i, /underserved/i] },
];

const SECTOR_TAG_RULES: { tag: string; patterns: RegExp[] }[] = [
  { tag: "saas", patterns: [/\bsaas\b/i, /software/i, /cloud/i, /b2b/i] },
  { tag: "fintech", patterns: [/fintech/i, /finance/i, /payments/i] },
  { tag: "healthtech", patterns: [/healthtech/i, /health tech/i, /medtech/i] },
  { tag: "biotech", patterns: [/biotech/i, /pharma/i, /life science/i] },
  { tag: "deeptech", patterns: [/deep.?tech/i, /hardware/i, /semiconductor/i] },
  { tag: "agritech", patterns: [/agritech/i, /agriculture/i, /farming/i] },
  { tag: "cleantech", patterns: [/cleantech/i, /climate/i, /renewable/i] },
  { tag: "edtech", patterns: [/edtech/i, /education/i] },
  { tag: "spacetech", patterns: [/space/i, /aerospace/i, /satellite/i] },
  { tag: "gaming", patterns: [/gaming/i, /game/i] },
  { tag: "web3", patterns: [/web3/i, /blockchain/i] },
  { tag: "mobility", patterns: [/mobility/i, /transport/i, /automotive/i] },
  { tag: "d2c", patterns: [/\bd2c\b/i, /ecommerce/i, /consumer/i] },
];

const CATEGORY_DEFAULTS: Record<string, string> = {
  "Startup Credits": "SaaS",
  Biotech: "Biotech",
};

function corpus(input: InferInput): string {
  return `${input.name} ${input.org} ${input.category} ${input.description} ${input.eligibility}`.toLowerCase();
}

function scoreIndustryRules(text: string): { label: string; score: number }[] {
  const scores: { label: string; score: number }[] = [];
  for (const rule of INDUSTRY_RULES) {
    let score = 0;
    for (const p of rule.patterns) {
      if (p.test(text)) score += rule.weight;
    }
    if (score > 0) scores.push({ label: rule.label, score });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

function inferIndustryFromText(input: InferInput): string | null {
  const text = corpus(input);
  const scored = scoreIndustryRules(text);
  if (scored.length === 0) {
    const catDefault = CATEGORY_DEFAULTS[input.category];
    if (catDefault) return catDefault;
    return null;
  }
  const top = scored.filter((s) => s.score >= scored[0].score * 0.6).slice(0, 3);
  return top.map((s) => s.label).join(", ");
}

function inferTagsFromText(input: InferInput): string[] {
  const text = corpus(input);
  const tags = new Set<string>(input.tags ?? []);

  for (const { tag, patterns } of SECTOR_TAG_RULES) {
    if (patterns.some((p) => p.test(text))) tags.add(tag);
  }

  if (/dpiit[- ]recogni[sz]ed|dpiit registered|startup india/i.test(text)) tags.add("dpiit-required");
  if (/registered company|pvt\.? ltd|incorporated|legal entity/i.test(text)) tags.add("incorporated-required");
  if (/women.?(entrepreneur|founder|led)|female founder|wep\b|her\s+startup/i.test(text)) tags.add("women-led");
  if (/student.?(entrepreneur|startup|founder)|campus|college founder|young entrepreneur/i.test(text)) tags.add("student-led");

  const stageText = `${input.stage} ${text}`;
  if (/pre[- ]?seed|idea stage|mvp/i.test(stageText)) tags.add("pre-seed");
  if (/\bseed\b/i.test(stageText) && !/pre[- ]?seed/i.test(stageText)) tags.add("seed");
  if (/series\s*a/i.test(stageText)) tags.add("series-a");
  if (/series\s*b|growth/i.test(stageText)) tags.add("growth");

  if (/global|worldwide|remote|anywhere/i.test(`${input.location} ${text}`)) tags.add("global");
  if (/\bindia\b/i.test(input.location) || /indian startup/i.test(text)) tags.add("india");

  const cat = input.category.toLowerCase();
  if (cat.includes("grant")) tags.add("grant");
  if (cat.includes("credit")) tags.add("credit");
  if (cat.includes("incubator")) tags.add("incubator");
  if (cat.includes("accelerator")) tags.add("accelerator");
  if (cat.includes("fellowship")) tags.add("fellowship");
  if (cat.includes("competition")) tags.add("competition");
  if (cat.includes("government")) tags.add("government");

  return [...tags].sort();
}

/** Full inference — industry + tags from text fields. */
export function inferOpportunityMeta(input: InferInput): InferredMeta {
  const inferredIndustry = inferIndustryFromText(input);
  const currentIndustry = input.industry?.trim() || "All";
  const industry =
    currentIndustry.toLowerCase() === "all" && inferredIndustry
      ? inferredIndustry
      : currentIndustry;

  const tags = inferTagsFromText({ ...input, industry });
  return { industry, tags };
}

/** Industry used for matching — persisted value or runtime inference. */
export function effectiveIndustry(input: InferInput): string {
  const current = input.industry?.trim() || "All";
  if (current.toLowerCase() !== "all") return current;
  return inferIndustryFromText(input) ?? "All";
}

/** Tags used for matching — merge persisted + inferred (deduped). */
export function effectiveTags(input: InferInput): string[] {
  const persisted = input.tags ?? [];
  const inferred = inferTagsFromText(input);
  return [...new Set([...persisted, ...inferred])].sort();
}
