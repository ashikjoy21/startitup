import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { OpportunityRow } from "@/components/opportunity-row";
import { getUser, getProfile } from "@/lib/auth.server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase.server";
import { listOpportunities } from "@/lib/api/opportunities.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Founder Dashboard — StartItUp.in" }] }),
  loader: async () => {
    const user = await getUser();
    if (!user) throw redirect({ to: "/login", search: { redirect: "/dashboard" } });

    const profile = await getProfile(user.id);
    const name =
      ((user.user_metadata?.name as string | undefined) ?? "").split(" ")[0] || "Founder";

    let savedCount = 0;
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { count } = await supabase
        .from("saved_opportunities")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      savedCount = count ?? 0;
    }

    const recs = await listOpportunities({
      data: {
        limit: 6,
        offset: 0,
        ...(profile?.stage ? { stage: profile.stage } : {}),
        ...(profile?.sector ? { industry: profile.sector } : {}),
      },
    });

    return {
      name,
      profile,
      savedCount,
      matchedCount: recs.total,
      recs: recs.items,
    };
  },
  component: Dashboard,
});

function Dashboard() {
  const { name, profile, savedCount, matchedCount, recs } = Route.useLoaderData();

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
              Based on your profile — {profileSummary} — here's what we recommend.{" "}
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
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-4">
          {[
            [String(matchedCount), "Matched"],
            [String(savedCount), "Saved"],
            ["0", "Applied"],
            ["—", "Est. Credits"],
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
          {recs.map((o) => (
            <OpportunityRow key={o.id} o={o} />
          ))}
        </div>

        {savedCount > 0 && (
          <>
            <div className="mt-12 flex items-end justify-between">
              <h2 className="font-serif text-[32px]">Saved</h2>
              <Link to="/saved" className="text-[13.5px] text-primary hover:underline">
                View all {savedCount} →
              </Link>
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
