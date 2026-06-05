import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { OpportunityRow } from "@/components/opportunity-row";
import { opportunities } from "@/lib/opportunities";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Founder Dashboard — StartItUp.in" }] }),
  component: Dashboard,
});

function Dashboard() {
  const recs = opportunities.slice(0, 6);
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="text-[13px] text-muted-foreground">Founder Dashboard</div>
          <h1 className="mt-2 font-serif text-[44px] leading-tight md:text-[56px]">
            Welcome back, <em className="italic text-primary">Aarav</em>.
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] text-foreground/75">
            Based on your profile — B2B SaaS, Seed stage, Bangalore — here's what we recommend this week.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-4">
          {[
            ["12", "Recommended"],
            ["4", "Saved"],
            ["2", "Applied"],
            ["₹18,40,000", "Estimated Credits"],
          ].map(([n, l]) => (
            <div key={l} className="bg-card p-5">
              <div className="font-serif text-[32px] leading-none">{n}</div>
              <div className="mt-2 text-[12.5px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-end justify-between">
          <h2 className="font-serif text-[32px]">Recommended for You</h2>
          <Link to="/opportunities" className="text-[13.5px] text-primary hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-6 space-y-3">
          {recs.map((o) => <OpportunityRow key={o.id} o={o} />)}
        </div>
      </section>
    </SiteLayout>
  );
}
