import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { OpportunityRow } from "@/components/opportunity-row";
import { listOpportunities } from "@/lib/api/opportunities.functions";
import { meityAccelerators, meityIncubators, MEITY_ACCELERATOR_URL, MEITY_INCUBATOR_URL, type MeityOrg } from "@/lib/meity";

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
    category: z.string().optional(),
  }),
  loader: () => listOpportunities({ data: { limit: 1000, offset: 0 } }),
  component: OpportunitiesPage,
});

const industries = ["All", "AI/ML", "DeepTech", "HealthTech", "AgriTech", "CleanTech", "Manufacturing", "FinTech", "Space", "Defence", "EdTech", "SaaS"];
const stages = ["All", "Idea", "MVP", "Early Revenue", "Growth", "Any"];
const locations = ["All", "India", "Global", "USA"];

function OpportunitiesPage() {
  const { items: opportunities, categories, total, source } = Route.useLoaderData();
  const search = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(search.category ?? "All");
  const [ind, setInd] = useState("All");
  const [stage, setStage] = useState("All");
  const [loc, setLoc] = useState("All");

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (q && !`${o.name} ${o.org} ${o.short} ${o.description}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (cat !== "All" && o.category !== cat) return false;
      if (ind !== "All" && !o.industry.split(",").map((s) => s.trim()).includes(ind)) return false;
      if (stage !== "All" && !o.stage.split(",").map((s) => s.trim()).includes(stage)) return false;
      if (loc !== "All" && !o.location.includes(loc)) return false;
      return true;
    });
  }, [opportunities, q, cat, ind, stage, loc]);

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
            <FilterGroup label="Location" value={loc} setValue={setLoc} options={locations} />
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

            {cat === "Accelerators" && (
              <MeitySection items={meityAccelerators} meityUrl={MEITY_ACCELERATOR_URL} />
            )}
            {cat === "Incubators" && (
              <MeitySection items={meityIncubators} meityUrl={MEITY_INCUBATOR_URL} />
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
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

const INITIAL_COUNT = 24;

function MeitySection({
  items,
  meityUrl,
}: {
  items: MeityOrg[];
  meityUrl: string;
}) {
  const [showAll, setShowAll] = useState(false);
  if (items.length === 0) return null;

  const visible = showAll ? items : items.slice(0, INITIAL_COUNT);

  return (
    <div className="mt-16 border-t border-border pt-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            MeitY Startup Hub
          </div>
          <h2 className="mt-1 font-serif text-[22px]">
            Also registered on MeitY Startup Hub
          </h2>
        </div>
        <a
          href={meityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-[13px] text-primary hover:underline md:block"
        >
          View all on msh.meity.gov.in →
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((org) => (
          <MeityCard key={org.id} org={org} meityUrl={meityUrl} />
        ))}
      </div>

      {!showAll && items.length > INITIAL_COUNT && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 w-full border border-border bg-card py-3 text-[13.5px] text-foreground/80 hover:bg-muted"
        >
          Show all {items.length} →
        </button>
      )}

      <div className="mt-6 text-center md:hidden">
        <a
          href={meityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-primary hover:underline"
        >
          View all on msh.meity.gov.in →
        </a>
      </div>
    </div>
  );
}

function MeityCard({ org, meityUrl }: { org: MeityOrg; meityUrl: string }) {
  const location = [org.city, org.state].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-3 border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <MeityLogo name={org.name} logoUrl={org.logoUrl} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-medium text-foreground">
            {org.name}
          </div>
          {location && (
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              {location}
            </div>
          )}
        </div>
      </div>

      {org.domains.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {org.domains.slice(0, 3).map((d) => (
            <span
              key={d}
              className="rounded-none border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {d}
            </span>
          ))}
          {org.domains.length > 3 && (
            <span className="px-1 py-0.5 text-[11px] text-muted-foreground">
              +{org.domains.length - 3} more
            </span>
          )}
        </div>
      )}

      <a
        href={meityUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto text-[12.5px] text-primary hover:underline"
      >
        Browse on MeitY →
      </a>
    </div>
  );
}

function MeityLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const size = 40;
  const base = "flex shrink-0 items-center justify-center border border-border bg-primary-soft overflow-hidden";

  if (logoUrl) {
    return (
      <div className={base} style={{ width: size, height: size, minWidth: size }}>
        <img src={logoUrl} alt={name} className="h-full w-full object-contain p-1" />
      </div>
    );
  }
  return (
    <div
      className={`${base} font-serif text-primary`}
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.45 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
