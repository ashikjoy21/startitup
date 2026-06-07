import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { DbOpportunity, DbSubmission } from "../database.types";
import { defaultCategories, seedOpportunities, slugify, type Opportunity } from "../opportunities";
import { toDbRow, toOpportunity } from "../opportunity-mapper";
import {
  assertAdminSecret,
  getSupabaseAdmin,
  isSupabaseConfigured,
} from "../supabase.server";

const opportunitySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  org: z.string().min(1),
  short: z.string().default(""),
  description: z.string().default(""),
  category: z.string().min(1),
  industry: z.string().default("All"),
  stage: z.string().default("Any"),
  location: z.string().default("India"),
  amount: z.string().default(""),
  deadline: z.string().default("Rolling"),
  eligibility: z.string().default(""),
  logo: z.string().default(""),
  sourceUrl: z.string().url().optional().nullable(),
});

const listFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  industry: z.string().optional(),
  stage: z.string().optional(),
  location: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(24),
  offset: z.number().int().min(0).default(0),
});

const submitSchema = z.object({
  submissionType: z.enum(["new", "edit", "report"]).default("new"),
  opportunityId: z.string().optional(),
  name: z.string().min(1),
  org: z.string().optional(),
  short: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  industry: z.string().optional(),
  stage: z.string().optional(),
  location: z.string().optional(),
  amount: z.string().optional(),
  deadline: z.string().optional(),
  eligibility: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  submitterEmail: z.string().email().optional(),
  submitterName: z.string().optional(),
  notes: z.string().optional(),
});

function fallbackList(filters: z.infer<typeof listFiltersSchema>) {
  let items = [...seedOpportunities];
  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter((o) =>
      `${o.name} ${o.org} ${o.short}`.toLowerCase().includes(q),
    );
  }
  if (filters.category && filters.category !== "All") {
    items = items.filter((o) => o.category === filters.category);
  }
  if (filters.industry && filters.industry !== "All") {
    items = items.filter((o) => o.industry === filters.industry);
  }
  if (filters.stage && filters.stage !== "All") {
    items = items.filter((o) => o.stage === filters.stage);
  }
  if (filters.location && filters.location !== "All") {
    items = items.filter((o) => o.location === filters.location);
  }
  const total = items.length;
  const page = items.slice(filters.offset, filters.offset + filters.limit);
  return {
    items: page,
    total,
    categories: [...defaultCategories],
    source: "seed" as const,
  };
}

export const listOpportunities = createServerFn({ method: "GET" })
  .inputValidator(listFiltersSchema)
  .handler(async ({ data }) => {
    if (!isSupabaseConfigured()) return fallbackList(data);

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("opportunities")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (data.category && data.category !== "All") query = query.eq("category", data.category);
    if (data.industry && data.industry !== "All") query = query.eq("industry", data.industry);
    if (data.stage && data.stage !== "All") query = query.eq("stage", data.stage);
    if (data.location && data.location !== "All") query = query.eq("location", data.location);
    if (data.q) {
      const term = `%${data.q}%`;
      query = query.or(
        `name.ilike.${term},org.ilike.${term},short.ilike.${term}`,
      );
    }

    const [{ data: rows, error, count }, { data: cats, error: catError }] = await Promise.all([
      query,
      supabase.from("categories").select("name").order("sort_order"),
    ]);

    if (error) throw new Error(error.message);
    if (catError) throw new Error(catError.message);

    return {
      items: (rows ?? []).map(toOpportunity),
      total: count ?? 0,
      categories: (cats ?? []).map((c) => c.name),
      source: "supabase" as const,
    };
  });

export const getOpportunityById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const id = decodeURIComponent(data.id).trim();

    if (!isSupabaseConfigured()) {
      const found = seedOpportunities.find((o) => o.id === id);
      if (!found) throw new Error("Opportunity not found");
      return { item: found, source: "seed" as const };
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) throw new Error("Opportunity not found");

    return { item: toOpportunity(row as DbOpportunity), source: "supabase" as const };
  });

export const getFeaturedOpportunities = createServerFn({ method: "GET" })
  .inputValidator(z.object({ limit: z.number().int().min(1).max(12).default(5) }))
  .handler(async ({ data }) => {
    const result = await listOpportunities({ data: { limit: data.limit, offset: 0 } });
    return { items: result.items, source: result.source };
  });

export const submitOpportunitySuggestion = createServerFn({ method: "POST" })
  .inputValidator(submitSchema)
  .handler(async ({ data }) => {
    if (!isSupabaseConfigured()) {
      return {
        ok: true as const,
        message: "Submission received (demo mode — connect Supabase to persist).",
      };
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("submissions").insert({
      submission_type: data.submissionType,
      opportunity_id: data.opportunityId ?? null,
      name: data.name,
      org: data.org ?? null,
      short: data.short ?? null,
      description: data.description ?? null,
      category: data.category ?? null,
      industry: data.industry ?? null,
      stage: data.stage ?? null,
      location: data.location ?? null,
      amount: data.amount ?? null,
      deadline: data.deadline ?? null,
      eligibility: data.eligibility ?? null,
      source_url: data.sourceUrl ?? null,
      submitter_email: data.submitterEmail ?? null,
      submitter_name: data.submitterName ?? null,
      notes: data.notes ?? null,
    });

    if (error) throw new Error(error.message);

    return {
      ok: true as const,
      message: "Thanks! Your suggestion is in the review queue.",
    };
  });

export const adminListOpportunities = createServerFn({ method: "POST" })
  .inputValidator(z.object({ adminSecret: z.string().min(1), q: z.string().optional() }))
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);

    if (!isSupabaseConfigured()) {
      let items = [...seedOpportunities];
      if (data.q) {
        const q = data.q.toLowerCase();
        items = items.filter((o) =>
          `${o.name} ${o.org} ${o.category}`.toLowerCase().includes(q),
        );
      }
      return { items, categories: [...defaultCategories], source: "seed" as const };
    }

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("opportunities")
      .select("*")
      .neq("status", "archived")
      .order("updated_at", { ascending: false });

    if (data.q) {
      const term = `%${data.q}%`;
      query = query.or(`name.ilike.${term},org.ilike.${term},category.ilike.${term}`);
    }

    const [{ data: rows, error }, { data: cats, error: catError }] = await Promise.all([
      query,
      supabase.from("categories").select("name").order("sort_order"),
    ]);

    if (error) throw new Error(error.message);
    if (catError) throw new Error(catError.message);

    return {
      items: (rows ?? []).map(toOpportunity),
      categories: (cats ?? []).map((c) => c.name),
      source: "supabase" as const,
    };
  });

export const adminUpsertOpportunity = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      adminSecret: z.string().min(1),
      opportunity: opportunitySchema,
    }),
  )
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);

    const opportunity: Opportunity = {
      ...data.opportunity,
      id: data.opportunity.id || slugify(data.opportunity.name),
      logo: data.opportunity.logo || data.opportunity.name.charAt(0).toUpperCase(),
    };

    if (!isSupabaseConfigured()) {
      return { item: opportunity, source: "seed" as const };
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("opportunities")
      .upsert(toDbRow(opportunity))
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { item: toOpportunity(row), source: "supabase" as const };
  });

export const adminDeleteOpportunity = createServerFn({ method: "POST" })
  .inputValidator(z.object({ adminSecret: z.string().min(1), id: z.string().min(1) }))
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);

    if (!isSupabaseConfigured()) return { ok: true as const, source: "seed" as const };

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("opportunities")
      .update({ status: "archived" })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true as const, source: "supabase" as const };
  });

export const adminListSubmissions = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      adminSecret: z.string().min(1),
      status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
    }),
  )
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);
    if (!isSupabaseConfigured()) return { items: [] as DbSubmission[], source: "seed" as const };

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.status !== "all") query = query.eq("status", data.status);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    return { items: (rows ?? []) as DbSubmission[], source: "supabase" as const };
  });

export const adminReviewSubmission = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      adminSecret: z.string().min(1),
      submissionId: z.string().uuid(),
      action: z.enum(["approve", "reject"]),
      reviewNotes: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);
    if (!isSupabaseConfigured()) {
      return { ok: true as const, source: "seed" as const };
    }

    const supabase = getSupabaseAdmin();
    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", data.submissionId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    if (data.action === "reject") {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          review_notes: data.reviewNotes ?? null,
        })
        .eq("id", data.submissionId);

      if (error) throw new Error(error.message);
      return { ok: true as const, source: "supabase" as const };
    }

    const id = slugify(submission.name);
    const opportunity = {
      id,
      name: submission.name,
      org: submission.org ?? "Unknown",
      short: submission.short ?? "",
      description: submission.description ?? "",
      category: submission.category ?? "Grants",
      industry: submission.industry ?? "All",
      stage: submission.stage ?? "Any",
      location: submission.location ?? "India",
      amount: submission.amount ?? "",
      deadline: submission.deadline ?? "Rolling",
      eligibility: submission.eligibility ?? "",
      logo: submission.name.charAt(0).toUpperCase(),
      source_url: submission.source_url,
      status: "published" as const,
    };

    const { error: upsertError } = await supabase.from("opportunities").upsert(opportunity);
    if (upsertError) throw new Error(upsertError.message);

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        review_notes: data.reviewNotes ?? null,
      })
      .eq("id", data.submissionId);

    if (updateError) throw new Error(updateError.message);

    return { ok: true as const, opportunityId: id, source: "supabase" as const };
  });

export const adminSetCategories = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      adminSecret: z.string().min(1),
      categories: z.array(z.string().min(1)),
    }),
  )
  .handler(async ({ data }) => {
    assertAdminSecret(data.adminSecret);
    const cleaned = Array.from(new Set(data.categories.map((c) => c.trim()).filter(Boolean)));

    if (!isSupabaseConfigured()) {
      return { categories: cleaned, source: "seed" as const };
    }

    const supabase = getSupabaseAdmin();
    const { error: deleteError } = await supabase.from("categories").delete().neq("id", 0);
    if (deleteError) throw new Error(deleteError.message);

    const rows = cleaned.map((name, index) => ({ name, sort_order: index + 1 }));
    const { error: insertError } = await supabase.from("categories").insert(rows);
    if (insertError) throw new Error(insertError.message);

    return { categories: cleaned, source: "supabase" as const };
  });
