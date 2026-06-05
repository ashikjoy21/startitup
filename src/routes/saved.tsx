import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { OpportunityRow } from "@/components/opportunity-row";
import { useOpportunitiesStore } from "@/lib/opportunities-store";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved Opportunities — StartItUp.in" }] }),
  component: Saved,
});

function Saved() {
  const { items } = useOpportunitiesStore();
  const saved = items.slice(2, 6);
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="text-[13px] text-muted-foreground">Your library</div>
          <h1 className="mt-2 font-serif text-[44px] leading-tight md:text-[56px]">Saved opportunities</h1>
          <p className="mt-3 text-[15px] text-foreground/75">
            {saved.length} saved · sorted by deadline
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-[1280px] space-y-3 px-6 py-12">
        {saved.map((o) => <OpportunityRow key={o.id} o={o} />)}
      </section>
    </SiteLayout>
  );
}
