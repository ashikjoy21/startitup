import { Link } from "@tanstack/react-router";
import { OpportunityRow } from "@/components/opportunity-row";
import type { Opportunity } from "@/lib/opportunities";

type Props = {
  items: Opportunity[];
};

export function SavedList({ items }: Props) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <h2 className="font-serif text-[28px]">Saved opportunities</h2>
        <span className="text-[12.5px] text-muted-foreground">{items.length} total</span>
      </div>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        Programs you&apos;ve bookmarked to review or apply later.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 py-16 text-center">
          <p className="text-[15px] text-muted-foreground">No saved opportunities yet.</p>
          <Link
            to="/opportunities"
            className="mt-4 inline-block text-[13.5px] text-primary hover:underline"
          >
            Browse opportunities →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((o) => (
            <OpportunityRow key={o.id} o={o} />
          ))}
        </div>
      )}
    </div>
  );
}
