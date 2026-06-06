import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { OpportunityRow } from "@/components/opportunity-row";
import { getUser } from "@/lib/auth.server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase.server";
import type { Opportunity } from "@/lib/opportunities";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved Opportunities — StartItUp.in" }] }),
  loader: async () => {
    const user = await getUser();
    if (!user) throw redirect({ to: "/login", search: { redirect: "/saved" } });

    if (!isSupabaseConfigured()) return { items: [] as Opportunity[] };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("saved_opportunities")
      .select("opportunity_id, opportunities(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const items = (data ?? [])
      .map((row) => row.opportunities)
      .filter(Boolean) as unknown as Opportunity[];

    return { items };
  },
  component: Saved,
});

function Saved() {
  const { items } = Route.useLoaderData();

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="text-[13px] text-muted-foreground">Saved</div>
          <h1 className="mt-2 font-serif text-[44px] leading-tight md:text-[56px]">
            Your saved opportunities
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[15px] text-muted-foreground">No saved opportunities yet.</p>
            <Link to="/opportunities" className="mt-4 inline-block text-[13.5px] text-primary hover:underline">
              Browse opportunities →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((o) => (
              <OpportunityRow key={o.id} o={o} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
