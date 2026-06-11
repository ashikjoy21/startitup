import type { SectorSource } from "@/lib/investors.types";

const SOURCE_LABELS: Record<Exclude<SectorSource, "heuristic">, string> = {
  manual: "Curated",
  meity: "MeitY registry",
  funding_article: "Funding news",
  firecrawl: "Company website",
};

export function SectorBadge({
  verified,
  source,
  evidenceUrl,
  className = "",
}: {
  verified?: boolean;
  source?: SectorSource;
  evidenceUrl?: string | null;
  className?: string;
}) {
  if (!verified || !source || source === "heuristic") return null;

  const label = SOURCE_LABELS[source];
  const title = evidenceUrl ? `${label} · ${evidenceUrl}` : label;

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-0.5 border border-emerald-600/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-300 ${className}`}
    >
      ✓ Verified
    </span>
  );
}
