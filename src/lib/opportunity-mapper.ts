import type { DbOpportunity } from "./database.types";
import type { Opportunity } from "./opportunities";

export function toOpportunity(row: DbOpportunity): Opportunity {
  return {
    id: row.id,
    name: row.name,
    org: row.org,
    short: row.short,
    description: row.description,
    category: row.category,
    industry: row.industry,
    stage: row.stage,
    location: row.location,
    amount: row.amount,
    deadline: row.deadline,
    eligibility: row.eligibility,
    logo: row.logo,
    sourceUrl: row.source_url,
    tags: row.tags ?? [],
  };
}

export function toDbRow(o: Opportunity) {
  return {
    id: o.id,
    name: o.name,
    org: o.org,
    short: o.short,
    description: o.description,
    category: o.category,
    industry: o.industry,
    stage: o.stage,
    location: o.location,
    amount: o.amount,
    deadline: o.deadline,
    eligibility: o.eligibility,
    logo: o.logo,
    source_url: o.sourceUrl ?? null,
    tags: o.tags ?? [],
    status: "published" as const,
  };
}
