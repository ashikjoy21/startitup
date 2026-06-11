import { defaultCategories, seedOpportunities, type Opportunity } from "../opportunities";
import { getSupabaseAdmin, isSupabaseConfigured } from "../supabase.server";
import { toOpportunity } from "../opportunity-mapper";
import type { DbOpportunity } from "../database.types";

export type McpToolResult =
  | { content: Array<{ type: "text"; text: string }> }
  | { isError: true; content: Array<{ type: "text"; text: string }> };

function text(s: string): McpToolResult {
  return { content: [{ type: "text", text: s }] };
}

function err(msg: string): McpToolResult {
  return { isError: true, content: [{ type: "text", text: msg }] };
}

// ── list_categories ─────────────────────────────────────────────────────────

export async function toolListCategories(): Promise<McpToolResult> {
  if (!isSupabaseConfigured()) {
    const cats = defaultCategories.map((c) => ({ name: c, count: 0 }));
    return text(JSON.stringify(cats, null, 2));
  }

  const supabase = getSupabaseAdmin();
  const [{ data: cats }, { data: rows }] = await Promise.all([
    supabase.from("categories").select("name").order("sort_order"),
    supabase
      .from("opportunities")
      .select("category")
      .eq("status", "published"),
  ]);

  const counts: Record<string, number> = {};
  for (const row of rows ?? []) {
    counts[row.category as string] = (counts[row.category as string] ?? 0) + 1;
  }

  const result = (cats ?? []).map((c) => ({
    name: c.name,
    count: counts[c.name] ?? 0,
  }));

  return text(JSON.stringify(result, null, 2));
}

// ── list_filters ─────────────────────────────────────────────────────────────

export async function toolListFilters(category?: string): Promise<McpToolResult> {
  let items: Opportunity[];

  if (!isSupabaseConfigured()) {
    items = category
      ? seedOpportunities.filter((o) => o.category === category)
      : seedOpportunities;
  } else {
    const supabase = getSupabaseAdmin();
    let q = supabase
      .from("opportunities")
      .select("industry, stage, location")
      .eq("status", "published");
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) return err(error.message);
    items = (data ?? []) as unknown as Opportunity[];
  }

  const industries = [...new Set(items.map((o) => o.industry).filter(Boolean))].sort();
  const stages = [...new Set(items.map((o) => o.stage).filter(Boolean))].sort();
  const locations = [...new Set(items.map((o) => o.location).filter(Boolean))].sort();

  return text(
    JSON.stringify({ industries, stages, locations }, null, 2),
  );
}

// ── search_opportunities ─────────────────────────────────────────────────────

export type SearchInput = {
  q?: string;
  category?: string;
  industry?: string;
  stage?: string;
  location?: string;
  limit?: number;
  offset?: number;
};

export async function toolSearchOpportunities(
  input: SearchInput,
): Promise<McpToolResult> {
  const limit = Math.min(input.limit ?? 10, 20);
  const offset = input.offset ?? 0;

  if (!isSupabaseConfigured()) {
    let items = [...seedOpportunities];
    if (input.q) {
      const q = input.q.toLowerCase();
      items = items.filter((o) =>
        `${o.name} ${o.org} ${o.short} ${o.description}`.toLowerCase().includes(q),
      );
    }
    if (input.category && input.category !== "All")
      items = items.filter((o) => o.category === input.category);
    if (input.industry && input.industry !== "All")
      items = items.filter((o) => o.industry === input.industry);
    if (input.stage && input.stage !== "All")
      items = items.filter((o) => o.stage === input.stage);
    if (input.location && input.location !== "All")
      items = items.filter((o) => o.location === input.location);
    const total = items.length;
    const page = items.slice(offset, offset + limit).map(summaryFields);
    return text(JSON.stringify({ items: page, total, offset, limit }, null, 2));
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("opportunities")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (input.category && input.category !== "All") query = query.eq("category", input.category);
  if (input.industry && input.industry !== "All") query = query.eq("industry", input.industry);
  if (input.stage && input.stage !== "All") query = query.eq("stage", input.stage);
  if (input.location && input.location !== "All") query = query.eq("location", input.location);
  if (input.q) {
    const term = `%${input.q}%`;
    query = query.or(`name.ilike.${term},org.ilike.${term},short.ilike.${term},description.ilike.${term}`);
  }

  const { data, error, count } = await query;
  if (error) return err(error.message);

  const items = (data ?? []).map(toOpportunity).map(summaryFields);
  return text(JSON.stringify({ items, total: count ?? 0, offset, limit }, null, 2));
}

// ── get_opportunity ──────────────────────────────────────────────────────────

export async function toolGetOpportunity(id: string): Promise<McpToolResult> {
  if (!isSupabaseConfigured()) {
    const found = seedOpportunities.find((o) => o.id === id);
    if (!found) return err(`Opportunity not found: ${id}`);
    return text(JSON.stringify(found, null, 2));
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) return err(error.message);
  if (!data) return err(`Opportunity not found: ${id}`);

  return text(JSON.stringify(toOpportunity(data as DbOpportunity), null, 2));
}

// ── helpers ──────────────────────────────────────────────────────────────────

function summaryFields(o: Opportunity) {
  return {
    id: o.id,
    name: o.name,
    org: o.org,
    short: o.short,
    category: o.category,
    amount: o.amount,
    deadline: o.deadline,
    stage: o.stage,
    location: o.location,
    tags: o.tags ?? [],
  };
}
