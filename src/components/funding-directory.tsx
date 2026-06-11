import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { SectorBadge } from "@/components/sector-badge";
import type { FundingRoundListItem } from "@/lib/investors.types";

const INITIAL_COUNT = 24;

function formatAmount(round: FundingRoundListItem): string {
  if (round.amount_text) return round.amount_text;
  if (round.amount_usd) {
    const m = round.amount_usd / 1_000_000;
    return m >= 1 ? `$${m.toFixed(0)}M` : `$${(round.amount_usd / 1000).toFixed(0)}K`;
  }
  return "Undisclosed";
}

function formatDate(d: string | null): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export function FundingDirectoryPage({
  items,
  total,
  roundTypes,
  builtAt,
  sectorsVerified,
  sectorsVerifiedFunded,
}: {
  items: FundingRoundListItem[];
  total: number;
  roundTypes: string[];
  builtAt?: string;
  sectorsVerified?: number;
  sectorsVerifiedFunded?: number;
}) {
  const [q, setQ] = useState("");
  const [roundType, setRoundType] = useState("All");
  const [count, setCount] = useState(INITIAL_COUNT);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (q) {
        const ql = q.toLowerCase();
        if (
          !r.startup_name.toLowerCase().includes(ql) &&
          !r.investors.some((n) => n.toLowerCase().includes(ql))
        ) {
          return false;
        }
      }
      if (roundType !== "All" && r.round_type !== roundType) return false;
      return true;
    });
  }, [items, q, roundType]);

  const visible = filtered.slice(0, count);
  const remaining = filtered.length - count;

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="text-[13px] text-muted-foreground">Funding</div>
          <h1 className="mt-2 font-serif text-[48px] leading-tight md:text-[60px]">
            Startup funding rounds
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-foreground/75">
            {total.toLocaleString()} funding events across Indian startups — curated seeds, Inc42,
            and Entrackr sources.
            {sectorsVerifiedFunded != null && sectorsVerifiedFunded > 0 && (
              <>
                {" "}
                {sectorsVerifiedFunded.toLocaleString()} funded startup sectors verified from funding
                news and MeitY data
                {sectorsVerified != null && sectorsVerified > sectorsVerifiedFunded
                  ? ` (${sectorsVerified.toLocaleString()} total in graph).`
                  : "."}
              </>
            )}
          </p>
          {builtAt && (
            <p className="mt-3 text-[13px] text-muted-foreground">
              Last updated {new Date(builtAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </p>
          )}
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-[1280px] px-6 py-6">
          <div className="flex flex-wrap gap-3">
            <input
              type="search"
              placeholder="Search startup or investor…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCount(INITIAL_COUNT);
              }}
              className="min-w-[200px] flex-1 border border-border bg-background px-4 py-2.5 text-[14px] outline-none focus:border-primary"
            />
            <select
              value={roundType}
              onChange={(e) => {
                setRoundType(e.target.value);
                setCount(INITIAL_COUNT);
              }}
              className="border border-border bg-background px-3 py-2.5 text-[14px]"
            >
              <option value="All">All round types</option>
              {roundTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Showing {visible.length} of {filtered.length} rounds
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          {visible.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">No funding rounds match your filters.</p>
          ) : (
            <>
              <div className="divide-y divide-border border border-border bg-card">
                {visible.map((round) => (
                  <FundingRow key={round.id} round={round} />
                ))}
              </div>
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setCount((c) => c + INITIAL_COUNT)}
                  className="mt-6 w-full border border-border bg-card py-3 text-[13.5px] text-foreground/80 hover:bg-muted"
                >
                  Show {Math.min(INITIAL_COUNT, remaining)} more ({remaining} remaining)
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function FundingRow({ round }: { round: FundingRoundListItem }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link
          to="/startups/$id"
          params={{ id: round.startup_id }}
          className="text-[15px] font-medium text-foreground hover:text-primary hover:underline"
        >
          {round.startup_name}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
          <span>{round.round_type}</span>
          {round.announced_date && (
            <>
              <span>·</span>
              <span>{formatDate(round.announced_date)}</span>
            </>
          )}
          {round.startup_sector && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                {round.startup_sector}
                <SectorBadge
                  verified={round.startup_sector_verified}
                  source={round.startup_sector_source}
                  evidenceUrl={round.startup_sector_evidence_url}
                />
              </span>
            </>
          )}
        </div>
        {round.article_excerpt && (
          <p className="mt-2 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-foreground/70">
            {round.article_excerpt}
          </p>
        )}
        {round.investors.length > 0 && (
          <div className="mt-2 text-[12px] text-foreground/70">
            {round.investors.slice(0, 4).join(", ")}
            {round.investors.length > 4 ? ` +${round.investors.length - 4} more` : ""}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span className="font-serif text-[20px] text-foreground">{formatAmount(round)}</span>
        <a
          href={round.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-primary hover:underline"
        >
          Source →
        </a>
      </div>
    </div>
  );
}
