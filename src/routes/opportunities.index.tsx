import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { OpportunityRow } from "@/components/opportunity-row";
import { listOpportunities } from "@/lib/api/opportunities.functions";
import {
  classifyDeadline,
  DEADLINE_FILTER_OPTIONS,
  type DeadlineFilter,
} from "@/lib/deadline-status";

export const Route = createFileRoute("/opportunities/")({
  head: () => ({
    meta: [
      { title: "Opportunities — StartItUp.in" },
      {
        name: "description",
        content:
          "Browse every startup opportunity in India — credits, grants, accelerators and more.",
      },
    ],
  }),
  validateSearch: z.object({
    q:        z.string().optional(),
    cat:      z.string().optional(),
    ind:      z.string().optional(),
    stage:    z.string().optional(),
    deadline: z.enum(["all", "rolling", "closing_week", "closing_month", "closing_later", "closed"]).optional(),
  }),
  loader: () => listOpportunities({ data: { limit: 1000, offset: 0 } }),
  component: OpportunitiesPage,
});

const industries = ["All", "AI/ML", "DeepTech", "HealthTech", "AgriTech", "CleanTech", "Manufacturing", "FinTech", "Space", "Defence", "EdTech", "SaaS"];
const stages = ["All", "Idea", "MVP", "Early Revenue", "Growth", "Any"];
function OpportunitiesPage() {
  const { items: opportunities, categories, total, source } = Route.useLoaderData();
  const search   = Route.useSearch();
  const navigate = useNavigate({ from: "/opportunities/" });

  const q        = search.q        ?? "";
  const cat      = search.cat      ?? "All";
  const ind      = search.ind      ?? "All";
  const stage    = search.stage    ?? "All";
  const deadline = search.deadline ?? "all";

  const setQ        = (v: string)         => navigate({ search: (p) => ({ ...p, q:        v || undefined }),                      replace: true });
  const setCat      = (v: string)         => navigate({ search: (p) => ({ ...p, cat:      v === "All" ? undefined : v }),          replace: true });
  const setInd      = (v: string)         => navigate({ search: (p) => ({ ...p, ind:      v === "All" ? undefined : v }),          replace: true });
  const setStage    = (v: string)         => navigate({ search: (p) => ({ ...p, stage:    v === "All" ? undefined : v }),          replace: true });
  const setDeadline = (v: DeadlineFilter) => navigate({ search: (p) => ({ ...p, deadline: v === "all"  ? undefined : v }),          replace: true });

  const baseFiltered = useMemo(() => {
    return opportunities.filter((o) => {
      if (q && !`${o.name} ${o.org} ${o.short} ${o.description}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (cat !== "All" && o.category !== cat) return false;
      if (ind !== "All" && !o.industry.split(",").map((s) => s.trim()).includes(ind)) return false;
      if (stage !== "All" && !o.stage.split(",").map((s) => s.trim()).includes(stage)) return false;
      return true;
    });
  }, [opportunities, q, cat, ind, stage]);

  const deadlineCounts = useMemo(() => {
    const counts: Record<DeadlineFilter, number> = {
      all: baseFiltered.length,
      rolling: 0,
      closing_week: 0,
      closing_month: 0,
      closing_later: 0,
      closed: 0,
    };
    for (const o of baseFiltered) {
      counts[classifyDeadline(o.deadline)] += 1;
    }
    return counts;
  }, [baseFiltered]);

  const filtered = useMemo(() => {
    if (deadline === "all") return baseFiltered;
    return baseFiltered.filter((o) => classifyDeadline(o.deadline) === deadline);
  }, [baseFiltered, deadline]);

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20 text-center">
          <h1 className="font-serif text-[52px] leading-[1.08] md:text-[68px]">
            Find the best startup
            <br />
            opportunities, <em className="italic text-primary">curated</em>.
          </h1>
          <ul className="mx-auto mt-10 max-w-xl space-y-2 text-left text-[14px] text-foreground/80">
            <li>· Apply to thousands of startup credits, grants and programs with one profile.</li>
            <li>· Get matched with opportunities relevant to your industry and stage.</li>
            <li>· Updated weekly with the freshest Indian and global programs.</li>
          </ul>
          {source === "seed" && (
            <p className="mt-6 text-[13px] text-amber-700">
              Demo data — connect your Supabase project in .env to load the live database.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-8">
            <FilterGroup label="Category" value={cat} setValue={setCat} options={["All", ...categories]} />
            <FilterGroup label="Industry" value={ind} setValue={setInd} options={industries} />
            <FilterGroup label="Stage" value={stage} setValue={setStage} options={stages} />
            <DeadlineFilterGroup
              value={deadline}
              setValue={setDeadline}
              options={DEADLINE_FILTER_OPTIONS.map((o) => ({
                id: o.id,
                label: o.label,
                count: deadlineCounts[o.id],
              }))}
            />
          </aside>

          <div>
            <div className="flex items-center gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search opportunities, organizations, programs…"
                className="h-11 w-full border border-border bg-card px-4 text-[14px] outline-none focus:border-primary"
              />
              <div className="hidden whitespace-nowrap text-[13px] text-muted-foreground md:block">
                {filtered.length} of {total} results
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {filtered.map((o) => (
                <OpportunityRow key={o.id} o={o} />
              ))}
              {filtered.length === 0 && (
                <div className="border border-border bg-card p-10 text-center text-[14px] text-muted-foreground">
                  No opportunities match your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function DeadlineFilterGroup({
  value,
  setValue,
  options,
}: {
  value: DeadlineFilter;
  setValue: (v: DeadlineFilter) => void;
  options: { id: DeadlineFilter; label: string; count: number }[];
}) {
  return (
    <div>
      <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
        Deadline
      </div>
      <ul className="space-y-1.5">
        {options.map((o) => (
          <li key={o.id}>
            <button
              onClick={() => setValue(o.id)}
              className={
                "flex w-full items-center justify-between gap-3 text-[13.5px] " +
                (value === o.id
                  ? "text-primary underline underline-offset-2"
                  : "text-foreground/80 hover:text-primary")
              }
            >
              <span>{o.label}</span>
              <span className="text-[11.5px] tabular-nums text-muted-foreground">{o.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilterGroup({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul className="space-y-1.5">
        {options.map((o) => (
          <li key={o}>
            <button
              onClick={() => setValue(o)}
              className={
                "text-[13.5px] " +
                (value === o
                  ? "text-primary underline underline-offset-2"
                  : "text-foreground/80 hover:text-primary")
              }
            >
              {o}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
