import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { SectorBadge } from "@/components/sector-badge";
import type { StartupDetail } from "@/lib/investors.types";

function formatDate(d: string | null): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

function formatAmount(amount: string | null, usd: number | null): string {
  if (amount?.trim()) return amount.trim();
  if (usd) {
    const m = usd / 1_000_000;
    return m >= 1 ? `$${m.toFixed(0)}M` : `$${(usd / 1000).toFixed(0)}K`;
  }
  return "Undisclosed";
}

export function StartupDetailPage({ startup }: { startup: StartupDetail }) {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-[1280px] px-6 py-14 md:py-20">
          <Link to="/startups" className="text-[13px] text-primary hover:underline">
            ← All funded startups
          </Link>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {startup.sector && (
                  <span className="border border-border bg-background px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {startup.sector}
                  </span>
                )}
                <SectorBadge
                  verified={startup.sector_verified}
                  source={startup.sector_source}
                  evidenceUrl={startup.sector_evidence_url}
                />
                {startup.location && (
                  <span className="text-[13px] text-muted-foreground">{startup.location}</span>
                )}
              </div>
              <h1 className="mt-4 font-serif text-[40px] leading-tight md:text-[52px]">
                {startup.name}
              </h1>
              {startup.description ? (
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/75">
                  {startup.description}
                </p>
              ) : (
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/75">
                  {startup.funding_round_count} funding{" "}
                  {startup.funding_round_count === 1 ? "event" : "events"} on record
                  {startup.investors.length > 0 &&
                    ` · backed by ${startup.investors.slice(0, 3).join(", ")}${startup.investors.length > 3 ? " and others" : ""}`}
                  .
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-4">
                {startup.website && (
                  <a
                    href={
                      startup.website.startsWith("http")
                        ? startup.website
                        : `https://${startup.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-primary hover:underline"
                  >
                    Website →
                  </a>
                )}
              </div>
            </div>

            <div className="grid min-w-[200px] grid-cols-2 gap-3 lg:grid-cols-1">
              <StatCard label="Funding rounds" value={startup.funding_round_count} />
              <StatCard label="Investors" value={startup.investors.length} />
              {startup.founding_year && (
                <StatCard label="Founded" value={startup.founding_year} />
              )}
            </div>
          </div>
        </div>
      </section>

      {startup.investors.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1280px] px-6 py-12">
            <h2 className="font-serif text-[28px]">Investors</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {startup.investors.map((name) => (
                <span key={name} className="border border-border px-3 py-1.5 text-[13px]">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          <h2 className="font-serif text-[28px]">Funding history</h2>
          <ul className="mt-8 divide-y divide-border border border-border bg-card">
            {startup.funding_rounds.map((r) => (
              <li key={r.id} className="px-5 py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[15px] font-medium">
                      <span>{r.round_type}</span>
                      {r.announced_date && (
                        <span className="text-[13px] font-normal text-muted-foreground">
                          {formatDate(r.announced_date)}
                        </span>
                      )}
                    </div>
                    {r.article_excerpt && (
                      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-foreground/75">
                        {r.article_excerpt}
                      </p>
                    )}
                    {r.investors.length > 0 && (
                      <p className="mt-2 text-[13px] text-muted-foreground">
                        {r.investors.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="font-serif text-[20px]">
                      {formatAmount(r.amount_text, r.amount_usd)}
                    </span>
                    <a
                      href={r.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-primary hover:underline"
                    >
                      Source →
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
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
