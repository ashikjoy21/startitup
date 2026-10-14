export const JOBS_PAGE_SIZE = 30;
const MAX_PAGE = 200;

/** Free-text search goes into a PostgREST or() filter, so drop its syntax characters. */
export function sanitizeTerm(q: string | undefined): string | undefined {
  const t = (q ?? "").replace(/[%,()*\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return t || undefined;
}

/** Search words for an AND-of-words match; short filler words are dropped. */
export function searchWords(q: string | undefined): string[] {
  const words = (sanitizeTerm(q) ?? "").toLowerCase().split(" ").filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return [...new Set(words)].slice(0, 6);
}
const STOP_WORDS = new Set(["in", "at", "for", "the", "and", "of", "a", "an", "to", "job", "jobs", "role", "roles", "opening", "openings"]);

// Mirrors public.job_role_family() in the database; order here is display order.
export const ROLE_FAMILIES = [
  "Software & IT",
  "Data & AI",
  "Engineering & Technical",
  "Product & Project Management",
  "Design & Creative",
  "Sales & Business Development",
  "Marketing & Communications",
  "Finance, Banking & Insurance",
  "Operations & Supply Chain",
  "Customer Support & Success",
  "HR & Recruitment",
  "Consulting & Strategy",
  "Legal & Compliance",
  "Healthcare & Life Sciences",
  "Education & Training",
  "Administration",
  "Other",
] as const;

// Bands match on the listed minimum experience and don't overlap.
export const EXPERIENCE_BANDS = {
  fresher: { label: "Fresher", range: [0, 0] },
  "1-3": { label: "1–3 yrs", range: [1, 2] },
  "3-6": { label: "3–6 yrs", range: [3, 5] },
  "6-10": { label: "6–10 yrs", range: [6, 9] },
  "10+": { label: "10+ yrs", range: [10, null] },
} as const satisfies Record<string, { label: string; range: readonly [number, number | null] }>;

export const POSTED_WITHIN = {
  "1d": { label: "Last 24 hours", days: 1 },
  "7d": { label: "Last 7 days", days: 7 },
  "30d": { label: "Last 30 days", days: 30 },
} as const;

export function pageRange(page: number): [number, number] {
  const p = Math.min(Math.max(1, Math.floor(page) || 1), MAX_PAGE);
  return [(p - 1) * JOBS_PAGE_SIZE, p * JOBS_PAGE_SIZE - 1];
}

export function postedLabel(iso: string | null, now = new Date()): string {
  if (!iso) return "";
  const days = Math.floor((now.getTime() - Date.parse(iso)) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 30) return `${days} days ago`;
  return "Over a month ago";
}
