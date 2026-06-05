import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { OpportunityRow } from "@/components/opportunity-row";
import { useOpportunitiesStore } from "@/lib/opportunities-store";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — StartItUp.in" },
      { name: "description", content: "Browse every startup opportunity in India — credits, grants, accelerators and more." },
    ],
  }),
  component: OpportunitiesPage,
});

const industries = ["All", "SaaS", "AI", "Biotech", "Deep Tech"];
const stages = ["All", "Pre-Seed", "Seed", "Series A", "Any"];
const locations = ["All", "India", "Global", "United Kingdom", "Remote / SF", "India / SEA"];

function OpportunitiesPage() {
  const { items: opportunities, categories } = useOpportunitiesStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [ind, setInd] = useState("All");
  const [stage, setStage] = useState("All");
  const [loc, setLoc] = useState("All");

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (q && !`${o.name} ${o.org} ${o.short}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "All" && o.category !== cat) return false;
      if (ind !== "All" && o.industry !== ind) return false;
      if (stage !== "All" && o.stage !== stage) return false;
      if (loc !== "All" && o.location !== loc) return false;
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
                {filtered.length} results
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
                (value === o ? "text-primary underline underline-offset-2" : "text-foreground/80 hover:text-primary")
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
