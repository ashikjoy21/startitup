import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { EXPERIENCE_BANDS, POSTED_WITHIN, ROLE_FAMILIES, pageRange, searchWords } from "../jobs-search";
import { getSupabaseAdmin, isSupabaseConfigured } from "../supabase.server";

const filtersSchema = z.object({
  q: z.string().optional(),
  city: z.string().max(60).optional(),
  company: z.string().max(120).optional(),
  kind: z.enum(["job", "internship", "graduate_program", "apprenticeship", "govt_job"]).optional(),
  mode: z.enum(["onsite", "hybrid", "remote"]).optional(),
  role: z.enum(ROLE_FAMILIES).optional(),
  exp: z.enum(Object.keys(EXPERIENCE_BANDS) as [keyof typeof EXPERIENCE_BANDS]).optional(),
  posted: z.enum(Object.keys(POSTED_WITHIN) as [keyof typeof POSTED_WITHIN]).optional(),
  page: z.number().int().min(1).default(1),
});

export type JobListing = {
  id: string;
  title: string;
  org: string;
  logo: string;
  locations: string[];
  workMode: string | null;
  kind: string | null;
  roleFamily: string | null;
  postedAt: string | null;
  applyUrl: string;
  experienceMin: number | null;
  experienceMax: number | null;
};

type Count = { name: string; n: number };
type Facets = { total: number; companies: number; cities: Count[]; orgs: Count[]; roles: Count[] };

export const listJobs = createServerFn({ method: "GET" })
  .inputValidator(filtersSchema)
  .handler(async ({ data }) => {
    if (!isSupabaseConfigured()) return { items: [] as JobListing[], total: 0 };
    const supabase = getSupabaseAdmin();
    const [from, to] = pageRange(data.page);
    let query = supabase
      .from("opportunities")
      .select("id, name, org, logo, locations, work_mode, kind, role_family, posted_at, apply_url, source_url, experience_min, experience_max", { count: "exact" })
      .eq("status", "published")
      .contains("audience", ["jobs"])
      .order("posted_at", { ascending: false, nullsFirst: false })
      .order("id")
      .range(from, to);
    if (data.city) query = query.contains("locations", [data.city]);
    if (data.company) query = query.eq("org", data.company);
    if (data.kind) query = query.eq("kind", data.kind);
    if (data.mode) query = query.eq("work_mode", data.mode);
    if (data.role) query = query.eq("role_family", data.role);
    if (data.exp) {
      const [min, max] = EXPERIENCE_BANDS[data.exp].range;
      query = query.gte("experience_min", min);
      if (max !== null) query = query.lte("experience_min", max);
    }
    if (data.posted) query = query.gte("posted_at", new Date(Date.now() - POSTED_WITHIN[data.posted].days * 86_400_000).toISOString());
    // Every word must appear in the title, employer or location, in any order.
    for (const w of searchWords(data.q)) query = query.or(`name.ilike.%${w}%,org.ilike.%${w}%,location.ilike.%${w}%`);

    const { data: rows, error, count } = await query;
    if (error) throw new Error(error.message);
    const items: JobListing[] = (rows ?? []).map((r) => ({
      id: r.id,
      title: r.name,
      org: r.org,
      logo: r.logo,
      locations: r.locations ?? [],
      workMode: r.work_mode,
      kind: r.kind,
      roleFamily: r.role_family,
      postedAt: r.posted_at,
      applyUrl: r.apply_url ?? r.source_url ?? "",
      experienceMin: r.experience_min,
      experienceMax: r.experience_max,
    }));
    return { items, total: count ?? 0 };
  });

export const getJobFacets = createServerFn({ method: "GET" }).handler(async (): Promise<Facets> => {
  if (!isSupabaseConfigured()) return { total: 0, companies: 0, cities: [], orgs: [], roles: [] };
  const { data, error } = await getSupabaseAdmin().rpc("jobs_facets");
  if (error) throw new Error(error.message);
  return data as Facets;
});
