import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import type { InvestorListItem } from "@/lib/investors.types";

const INITIAL_COUNT = 24;

const TYPE_LABELS: Record<string, string> = {
  VC: "Venture Capital",
  Angel: "Angel",
  "Family Office": "Family Office",
  "Corporate VC": "Corporate VC",
  Syndicate: "Syndicate",
  Other: "Other",
};

export function InvestorDirectoryPage({
  items,
  total,
  types,
  stages,
  builtAt,
}: {
  items: InvestorListItem[];
  total: number;
  types: string[];
  stages: string[];
  builtAt?: string;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [stage, setStage] = useState("All");
  const [count, setCount] = useState(INITIAL_COUNT);

  const filtered = useMemo(() => {
    return items.filter((inv) => {
      if (q && !inv.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (type !== "All" && inv.type !== type) return false;
      if (stage !== "All" && !inv.investment_stages.some((s) => s.toLowerCase().includes(stage.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [items, q, type, stage]);

  const visible = filtered.slice(0, count);
  const remaining = filtered.length - count;

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="text-[13px] text-muted-foreground">Directory</div>
          <h1 className="mt-2 font-serif text-[48px] leading-tight md:text-[60px]">
            Investors in India
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-foreground/75">
            {total.toLocaleString()} VCs, angels, and funds backing Indian startups — sourced from
            MeitY, Inc42, Entrackr, and portfolio data.
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
              placeholder="Search investors…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCount(INITIAL_COUNT);
              }}
              className="min-w-[200px] flex-1 border border-border bg-background px-4 py-2.5 text-[14px] outline-none focus:border-primary"
            />
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCount(INITIAL_COUNT);
              }}
              className="border border-border bg-background px-3 py-2.5 text-[14px]"
            >
              <option value="All">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
            <select
              value={stage}
              onChange={(e) => {
                setStage(e.target.value);
                setCount(INITIAL_COUNT);
              }}
              className="border border-border bg-background px-3 py-2.5 text-[14px]"
            >
              <option value="All">All stages</option>
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Showing {visible.length} of {filtered.length} investors
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1280px] px-6 py-12">
          {visible.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">No investors match your filters.</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((inv) => (
                  <InvestorCard key={inv.id} investor={inv} />
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

function InvestorCard({ investor }: { investor: InvestorListItem }) {
  return (
    <Link
      to="/investors/$id"
      params={{ id: investor.id }}
      className="flex flex-col gap-3 border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div>
        <div className="text-[14px] font-medium text-foreground">{investor.name}</div>
        <div className="mt-1 text-[12px] text-muted-foreground">
          {TYPE_LABELS[investor.type] ?? investor.type}
          {investor.location ? ` · ${investor.location}` : ""}
        </div>
      </div>
      {investor.portfolio_count > 0 && (
        <div className="text-[12px] text-muted-foreground">
          {investor.portfolio_count} portfolio {investor.portfolio_count === 1 ? "company" : "companies"}
        </div>
      )}
      {investor.sector_focus.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {investor.sector_focus.slice(0, 3).map((s) => (
            <span
              key={s}
              className="border border-primary/15 bg-primary/5 px-2 py-0.5 text-[11px] text-foreground/80"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      {investor.investment_stages.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {investor.investment_stages.slice(0, 3).map((s) => (
            <span
              key={s}
              className="border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      <span className="mt-auto text-[12px] font-medium text-primary">View profile →</span>
    </Link>
  );
}
