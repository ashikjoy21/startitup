import { Link } from "@tanstack/react-router";
import type { Opportunity } from "@/lib/opportunities";

export function OpportunityRow({ o }: { o: Opportunity }) {
  return (
    <div className="flex flex-col gap-4 border border-border bg-card p-5 md:flex-row md:items-center">
      <div className="flex flex-1 items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-primary-soft font-serif text-xl text-primary">
          {o.logo}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 text-[13.5px]">
            <span className="font-semibold text-foreground">{o.org}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{o.short}</span>
          </div>
          <Link
            to="/opportunities/$id"
            params={{ id: o.id }}
            className="mt-1 block text-[15px] font-medium text-primary hover:underline"
          >
            {o.name}
          </Link>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
            <span>{o.category}</span>
            <span>·</span>
            <span>{o.industry}</span>
            <span>·</span>
            <span>{o.amount}</span>
            <span>·</span>
            <span>Deadline: {o.deadline}</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button className="h-9 border border-border bg-background px-3 text-[13px] hover:bg-muted">
          Save
        </button>
        <Link
          to="/opportunities/$id"
          params={{ id: o.id }}
          className="inline-flex h-9 items-center bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary-dark"
        >
          View
        </Link>
      </div>
    </div>
  );
}
