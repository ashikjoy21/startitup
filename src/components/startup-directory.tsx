import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { SectorBadge } from "@/components/sector-badge";
import type { StartupListItem } from "@/lib/investors.types";

const INITIAL_COUNT = 24;

function formatDate(d: string | null): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export function StartupDirectoryPage({
  items,
  total,
  sectors,
  builtAt,
  sectorsVerifiedFunded,
}: {
  items: StartupListItem[];
  total: number;
  sectors: string[];
  builtAt?: string;
  sectorsVerifiedFunded?: number;
}) {
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("All");
  const [count, setCount] = useState(INITIAL_COUNT);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      if (q) {
        const ql = q.toLowerCase();
        if (
          !s.name.toLowerCase().includes(ql) &&
          !(s.sector?.toLowerCase().includes(ql) ?? false) &&
          !(s.location?.toLowerCase().includes(ql) ?? false) &&
          !(s.description?.toLowerCase().includes(ql) ?? false)
        ) {
          return false;
        }
      }
      if (sector !== "All" && (s.sector?.trim() || "Technology") !== sector) return false;
      return true;
    });
  }, [items, q, sector]);

  const visible = filtered.slice(0, count);
  const remaining = filtered.length - count;

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="text-[13px] text-muted-foreground">Directory</div>
          <h1 className="mt-2 font-serif text-[48px] leading-tight md:text-[60px]">
            Funded startups
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-foreground/75">
            {total.toLocaleString()} Indian startups with funding on record — sectors, rounds, and
            context from Inc42 and Entrackr articles.
            {sectorsVerifiedFunded != null && sectorsVerifiedFunded > 0 && (
              <> {sectorsVerifiedFunded.toLocaleString()} sectors verified.</>
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
              placeholder="Search startup, sector, or city…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCount(INITIAL_COUNT);
              }}
              className="min-w-[200px] flex-1 border border-border bg-background px-4 py-2.5 text-[14px] outline-none focus:border-primary"
            />
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setCount(INITIAL_COUNT);
              }}
              className="border border-border bg-background px-3 py-2.5 text-[14px]"
            >
              <option value="All">All sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Showing {visible.length} of {filtered.length} startups
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          {visible.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">No startups match your filters.</p>
          ) : (
            <>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((s) => (
                  <li key={s.id}>
                    <Link
                      to="/startups/$id"
                      params={{ id: s.id }}
                      className="flex h-full flex-col gap-2 border border-border bg-card px-5 py-4 transition-colors hover:border-primary/30"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <span className="text-[15px] font-medium leading-snug">{s.name}</span>
                        {s.latest_round_date && (
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatDate(s.latest_round_date)}
                          </span>
                        )}
                      </div>
                      {s.sector && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[12px] text-muted-foreground">{s.sector}</span>
                          <SectorBadge
                            verified={s.sector_verified}
                            source={s.sector_source}
                            evidenceUrl={s.sector_evidence_url}
                          />
                        </div>
                      )}
                      {s.description && (
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground/70">
                          {s.description}
                        </p>
                      )}
                      <div className="mt-auto flex flex-wrap gap-3 text-[12px] text-muted-foreground">
                        {s.location && <span>{s.location}</span>}
                        {s.funding_round_count > 0 && (
                          <span>
                            {s.funding_round_count} round{s.funding_round_count === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
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
