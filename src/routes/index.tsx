import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout } from "@/components/site-layout";
import { OpportunityRow } from "@/components/opportunity-row";
import { listOpportunities } from "@/lib/api/opportunities.functions";
import { meityIncubators, meityAccelerators } from "@/lib/meity";
import { defaultCategories } from "@/lib/opportunities";

const INCUBATOR_COUNT = meityIncubators.length;
const ACCELERATOR_COUNT = meityAccelerators.length;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StartItUp.in — Every startup opportunity in India." },
      {
        name: "description",
        content:
          "Discover startup credits, grants, accelerators, incubators, fellowships, and funding opportunities for Indian founders.",
      },
      { property: "og:title", content: "StartItUp.in — Every startup opportunity in India." },
      {
        property: "og:description",
        content:
          "Discover startup credits, grants, accelerators, incubators, fellowships, and funding opportunities for Indian founders.",
      },
    ],
  }),
  loader: async () => {
    const list = await listOpportunities({ data: { limit: 10, offset: 0 } });
    return {
      items: list.items,
      total: list.total,
      source: list.source,
    };
  },
  component: Index,
});

const CATEGORY_PILLS = ["All", ...defaultCategories] as const;

function Index() {
  const { items, total, source } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    return items.filter((o) => {
      if (cat !== "All" && o.category !== cat) return false;
      if (q && !`${o.name} ${o.org} ${o.short}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [items, q, cat]);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-[72px] leading-[1.04] tracking-[-0.01em] text-foreground md:text-[96px]">
          Building a startup is hard.
          <br />
          <em className="italic text-primary">Finding opportunities shouldn't be.</em>
        </h1>

        <div className="mt-16 text-muted-foreground">
          <svg className="mx-auto h-5 w-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {source === "seed" && (
          <p className="mt-4 text-[12px] text-amber-700">
            Demo data — connect Supabase in .env to load the live database.
          </p>
        )}
      </section>

      {/* Stats row */}
      <section className="border-b border-t border-border">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            [INCUBATOR_COUNT.toString(), "Incubators"],
            [ACCELERATOR_COUNT.toString(), "Accelerators"],
            [`${total}+`, "Opportunities"],
            ["Weekly", "Updated"],
          ].map(([n, l]) => (
            <div key={l} className="px-8 py-10">
              <div className="font-serif text-[44px] leading-none text-foreground">{n}</div>
              <div className="mt-3 text-[13px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse */}
      <section className="mx-auto max-w-[1280px] px-6 py-16">
        {/* Search */}
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search opportunities, organisations, programs…"
          className="w-full border border-border bg-card px-5 py-3.5 text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {/* Category pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORY_PILLS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`inline-flex h-8 items-center border px-3 text-[12.5px] transition-colors ${
                cat === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground/75 hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Listing */}
        <div className="mt-8 space-y-3">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-[14px] text-muted-foreground">
              No results. <button onClick={() => { setQ(""); setCat("All"); }} className="text-primary underline">Clear filters</button>
            </p>
          ) : (
            filtered.map((o) => <OpportunityRow key={o.id} o={o} />)
          )}
        </div>

        {/* See all link */}
        <div className="mt-10 text-center">
          <Link
            to="/opportunities"
            className="inline-flex h-11 items-center border border-border bg-card px-6 text-[13.5px] font-medium hover:bg-muted"
          >
            See all {total} opportunities →
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
