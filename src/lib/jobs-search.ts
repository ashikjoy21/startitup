export const JOBS_PAGE_SIZE = 30;
const MAX_PAGE = 200;

/** Free-text search goes into a PostgREST or() filter, so drop its syntax characters. */
export function sanitizeTerm(q: string | undefined): string | undefined {
  const t = (q ?? "").replace(/[%,()*\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return t || undefined;
}

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
