import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { OpportunityRow } from "@/components/opportunity-row";
import { loadDashboard } from "@/lib/api/auth.functions";

const CATEGORIES = [
  "Grants",
  "Startup Credits",
  "Accelerators",
  "Incubators",
  "Government Schemes",
  "Fellowships",
  "Competitions",
  "Investor Programs",
] as const;

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Founder Dashboard — StartItUp.in" }] }),
  loader: async () => {
    const data = await loadDashboard();
    if (!data.authenticated) {
      throw redirect({ to: "/login", search: { redirect: "/dashboard" } });
    }
    return data;
  },
  component: Dashboard,
});

function Dashboard() {
  const { name, profile, savedCount, totalCount, newThisWeekCount, recs, newItems } =
    Route.useLoaderData();

  const profileSummary = [profile?.stage, profile?.sector, profile?.funding_status]
    .filter(Boolean)
    .join(" · ");

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="text-[13px] text-muted-foreground">Founder Dashboard</div>
          <h1 className="mt-2 font-serif text-[44px] leading-tight md:text-[56px]">
            Welcome back, <em className="italic text-primary">{name}</em>.
          </h1>
          {profileSummary ? (
            <p className="mt-3 max-w-2xl text-[15px] text-foreground/75">
              Showing opportunities relevant to{" "}
              <span className="text-foreground">{profileSummary}</span>.{" "}
              <Link to="/profile" className="text-primary hover:underline">
                Edit profile →
              </Link>
            </p>
          ) : (
            <p className="mt-3 max-w-2xl text-[15px] text-foreground/75">
              <Link to="/profile" className="text-primary hover:underline">
                Complete your profile →
              </Link>{" "}
              to get personalised recommendations.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {[
            [totalCount > 0 ? String(totalCount) : "—", "Opportunities"],
            [String(savedCount), "Saved"],
            [newThisWeekCount > 0 ? `+${newThisWeekCount}` : "—", "New This Week"],
          ].map(([n, l]) => (
            <div key={l} className="bg-card p-5">
              <div className="font-serif text-[32px] leading-none">{n}</div>
              <div className="mt-2 text-[12.5px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>

        {/* Category quick-browse */}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to="/opportunities"
              search={{ category: cat }}
              className="border border-border bg-card px-3.5 py-1.5 text-[12.5px] text-foreground/80 transition-colors hover:border-primary hover:text-primary"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Profile completion CTA */}
        {!profileSummary && (
          <div className="mt-6 flex items-center justify-between border border-border bg-card px-5 py-4">
            <p className="text-[13.5px] text-foreground/80">
              Tell us your stage and sector so we can surface the most relevant opportunities.
            </p>
            <Link
              to="/profile"
              className="ml-4 shrink-0 bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
            >
              Complete profile →
            </Link>
          </div>
        )}

        {/* Recommended for You */}
        <div className="mt-12 flex items-end justify-between">
          <h2 className="font-serif text-[32px]">Recommended for You</h2>
          <Link to="/opportunities" className="text-[13.5px] text-primary hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-6 space-y-3">
          {recs.length > 0 ? (
            recs.map((o) => <OpportunityRow key={o.id} o={o} />)
          ) : (
            <div className="border border-border bg-card py-16 text-center">
              <p className="text-[14px] text-muted-foreground">No opportunities yet.</p>
              <Link
                to="/opportunities"
                className="mt-2 inline-block text-[13.5px] text-primary hover:underline"
              >
                Browse all →
              </Link>
            </div>
          )}
        </div>

        {/* New This Week */}
        {newItems.length > 0 && (
          <>
            <div className="mt-12 flex items-baseline gap-3">
              <h2 className="font-serif text-[32px]">New This Week</h2>
              <span className="bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                +{newThisWeekCount}
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {newItems.map((o) => (
                <OpportunityRow key={o.id} o={o} />
              ))}
            </div>
          </>
        )}

        {/* Saved shortcut */}
        {savedCount > 0 && (
          <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
            <div>
              <p className="font-serif text-[24px]">Saved</p>
              <p className="text-[13px] text-muted-foreground">
                {savedCount} saved {savedCount === 1 ? "opportunity" : "opportunities"}
              </p>
            </div>
            <Link to="/saved" className="text-[13.5px] text-primary hover:underline">
              View all {savedCount} →
            </Link>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
