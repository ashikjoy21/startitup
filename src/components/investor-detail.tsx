import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { SectorBadge } from "@/components/sector-badge";
import type { InvestorDetail } from "@/lib/investors.types";

const TYPE_LABELS: Record<string, string> = {
  VC: "Venture Capital",
  Angel: "Angel Network",
  "Family Office": "Family Office",
  "Corporate VC": "Corporate VC",
  Syndicate: "Syndicate",
  Other: "Investor",
};

function formatDate(d: string | null): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

function formatAmount(amount: string | null): string {
  return amount?.trim() || "Undisclosed";
}

export function InvestorDetailPage({ investor }: { investor: InvestorDetail }) {
  const [sectorFilter, setSectorFilter] = useState("All");

  const filteredPortfolio = useMemo(() => {
    let list = investor.portfolio;
    if (sectorFilter === "All") {
      return list;
    }
    return list.filter((s) => (s.sector?.trim() || "Technology") === sectorFilter);
  }, [investor.portfolio, sectorFilter]);

  const sectors = investor.sector_breakdown.map((s) => s.sector);
  const verifiedCount = investor.portfolio.filter((s) => s.sector_verified).length;
  const hasPortfolio = investor.portfolio.length > 0;
  const hasFocus = investor.sector_focus.length > 0 || investor.investment_stages.length > 0;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-[1280px] px-6 py-14 md:py-20">
          <Link to="/investors" className="text-[13px] text-primary hover:underline">
            ← All investors
          </Link>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-border bg-background px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {TYPE_LABELS[investor.type] ?? investor.type}
                </span>
                {investor.location && (
                  <span className="text-[13px] text-muted-foreground">{investor.location}</span>
                )}
              </div>
              <h1 className="mt-4 font-serif text-[40px] leading-tight md:text-[52px]">
                {investor.name}
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/75">
                {hasPortfolio
                  ? `Active in the Indian startup ecosystem with ${investor.portfolio_count.toLocaleString()} known portfolio ${investor.portfolio_count === 1 ? "company" : "companies"}.`
                  : "Profile sourced from funding news and ecosystem data."}
                {investor.recent_rounds.length > 0 &&
                  ` ${investor.recent_rounds.length} recent funding ${investor.recent_rounds.length === 1 ? "event" : "events"} on record.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-4">
                {investor.website && (
                  <a
                    href={
                      investor.website.startsWith("http")
                        ? investor.website
                        : `https://${investor.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-primary hover:underline"
                  >
                    Website →
                  </a>
                )}
                {investor.linkedin && (
                  <a
                    href={investor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-primary hover:underline"
                  >
                    LinkedIn →
                  </a>
                )}
              </div>
            </div>

            <div className="grid min-w-[240px] grid-cols-2 gap-3 lg:grid-cols-1">
              <StatCard label="Portfolio companies" value={investor.portfolio_count} />
              <StatCard label="Funding events" value={investor.recent_rounds.length} />
              <StatCard label="Focus areas" value={investor.sector_focus.length || sectors.length} />
              <StatCard label="Stages" value={investor.investment_stages.length} />
            </div>
          </div>
        </div>
      </section>

      {hasFocus && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1280px] px-6 py-12">
            <h2 className="font-serif text-[28px]">Investment focus</h2>
            <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
              Sectors and stages this investor is known to back in India.
            </p>

            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              {investor.sector_focus.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
                    Sectors
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {investor.sector_focus.map((s) => (
                      <span
                        key={s}
                        className="border border-primary/20 bg-primary/5 px-3 py-1.5 text-[13px] text-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {investor.investment_stages.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
                    Stages
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {investor.investment_stages.map((s) => (
                      <span key={s} className="border border-border px-3 py-1.5 text-[13px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {investor.sector_breakdown.length > 1 && (
              <div className="mt-10">
                <h3 className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
                  Portfolio by sector
                </h3>
                <ul className="mt-4 space-y-3">
                  {investor.sector_breakdown.slice(0, 10).map(({ sector, count }) => {
                    const pct = Math.round((count / investor.portfolio.length) * 100);
                    return (
                      <li key={sector}>
                        <div className="mb-1 flex justify-between text-[13px]">
                          <span>{sector}</span>
                          <span className="text-muted-foreground">
                            {count} · {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted">
                          <div
                            className="h-full bg-primary/70"
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-[28px]">
                Portfolio
                {hasPortfolio ? ` (${investor.portfolio.length})` : ""}
              </h2>
              <p className="mt-2 text-[14px] text-muted-foreground">
                Startups linked to this investor from portfolio pages and funding data.
                {verifiedCount > 0 && (
                  <>
                    {" "}
                    {verifiedCount} sector{verifiedCount === 1 ? "" : "s"} verified from news and
                    registry sources.
                  </>
                )}
              </p>
            </div>
            {sectors.length > 1 && (
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="border border-border bg-background px-3 py-2 text-[13px]"
              >
                <option value="All">All sectors</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>

          {!hasPortfolio ? (
            <p className="mt-8 text-[14px] text-muted-foreground">
              No portfolio companies on record yet. Check related funding below or visit their
              website for more.
            </p>
          ) : (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPortfolio.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/startups/$id"
                    params={{ id: s.id }}
                    className="flex flex-col gap-1 border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/30"
                  >
                    <span className="text-[14px] font-medium leading-snug">{s.name}</span>
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
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hasPortfolio && sectorFilter !== "All" && filteredPortfolio.length === 0 && (
            <p className="mt-6 text-[14px] text-muted-foreground">
              No companies in this sector.
            </p>
          )}
        </div>
      </section>

      {investor.recent_rounds.length > 0 && (
        <section>
          <div className="mx-auto max-w-[1280px] px-6 py-12">
            <h2 className="font-serif text-[28px]">Recent funding activity</h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              Funding rounds where this investor participated.
            </p>
            <ul className="mt-8 divide-y divide-border border border-border bg-card">
              {investor.recent_rounds.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      to="/startups/$id"
                      params={{ id: r.startup_id }}
                      className="text-[15px] font-medium hover:text-primary hover:underline"
                    >
                      {r.startup_name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                      <span>{r.round_type}</span>
                      {r.announced_date && (
                        <>
                          <span>·</span>
                          <span>{formatDate(r.announced_date)}</span>
                        </>
                      )}
                      {r.startup_sector && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1.5">
                            {r.startup_sector}
                            <SectorBadge
                              verified={r.startup_sector_verified}
                              source={r.startup_sector_source}
                              evidenceUrl={r.startup_sector_evidence_url}
                            />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="font-serif text-[18px]">{formatAmount(r.amount_text)}</span>
                    <a
                      href={r.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-primary hover:underline"
                    >
                      Source →
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-card px-4 py-4">
      <div className="font-serif text-[28px] leading-none">{value.toLocaleString()}</div>
      <div className="mt-1 text-[12px] text-muted-foreground">{label}</div>
    </div>
  );
}
