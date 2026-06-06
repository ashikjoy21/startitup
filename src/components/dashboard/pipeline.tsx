import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import type { PipelineOpportunity } from "@/lib/api/auth.functions";
import { updateSavedStatus, unsaveOpportunity } from "@/lib/api/auth.functions";
import type { SavedStatus } from "@/lib/database.types";

const COLUMNS: { status: SavedStatus; label: string }[] = [
  { status: "saved", label: "Saved" },
  { status: "applied", label: "Applied" },
  { status: "under_review", label: "Under Review" },
  { status: "won", label: "Won" },
];

type Pipeline = Record<SavedStatus, PipelineOpportunity[]>;

type Props = { pipeline: Pipeline };

export function PipelineKanban({ pipeline }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  async function moveCard(opportunityId: string, status: SavedStatus) {
    setLoading(opportunityId);
    setMutationError(null);
    try {
      await updateSavedStatus({ data: { opportunityId, status } });
      await router.invalidate();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setLoading(null);
    }
  }

  async function removeCard(opportunityId: string) {
    setLoading(opportunityId);
    setMutationError(null);
    try {
      await unsaveOpportunity({ data: { opportunityId } });
      await router.invalidate();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Failed to remove.");
    } finally {
      setLoading(null);
    }
  }

  const totalCount = Object.values(pipeline).reduce((sum, col) => sum + col.length, 0);

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <h2 className="font-serif text-[28px]">Opportunity Pipeline</h2>
        <span className="text-[12.5px] text-muted-foreground">{totalCount} total</span>
      </div>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        Track your applications from saved to won.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map(({ status, label }) => {
          const cards = pipeline[status];
          return (
            <div key={status} className="flex flex-col">
              <div className="flex items-center justify-between border border-border bg-muted/30 px-3 py-2.5">
                <span className="text-[12.5px] font-medium">{label}</span>
                <span className="bg-border px-1.5 py-0.5 text-[11px] font-medium">
                  {cards.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 border border-t-0 border-border p-2 min-h-[120px]">
                {cards.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-8">
                    <p className="text-[12px] text-muted-foreground/50">Empty</p>
                  </div>
                )}
                {cards.map((o) => (
                  <PipelineCard
                    key={o.id}
                    opportunity={o}
                    currentStatus={status}
                    isLoading={loading === o.id}
                    onMove={(s) => moveCard(o.id, s)}
                    onRemove={() => removeCard(o.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {mutationError && <p className="mt-2 text-[12.5px] text-destructive">{mutationError}</p>}
    </div>
  );
}

type CardProps = {
  opportunity: PipelineOpportunity;
  currentStatus: SavedStatus;
  isLoading: boolean;
  onMove: (status: SavedStatus) => void;
  onRemove: () => void;
};

function PipelineCard({ opportunity: o, currentStatus, isLoading, onMove, onRemove }: CardProps) {
  const otherColumns = COLUMNS.filter((c) => c.status !== currentStatus);

  return (
    <div
      className={[
        "border border-border bg-card p-3 transition-opacity",
        isLoading ? "opacity-40 pointer-events-none" : "",
      ].join(" ")}
    >
      <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{o.category}</p>
      <Link
        to="/opportunities/$id"
        params={{ id: o.id }}
        className="mt-0.5 block font-serif text-[14px] leading-snug hover:text-primary"
      >
        {o.name}
      </Link>
      {o.amount && o.amount !== "—" && (
        <p className="mt-1 text-[11.5px] text-emerald-600">{o.amount}</p>
      )}
      {o.deadline && o.deadline !== "—" && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">Due: {o.deadline}</p>
      )}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {otherColumns.map(({ status, label }) => (
          <button
            key={status}
            onClick={() => onMove(status)}
            aria-label={`Move to ${label}`}
            className="border border-border px-2 py-0.5 text-[10.5px] text-foreground/60 hover:border-primary hover:text-primary"
          >
            <span aria-hidden="true">→ </span>
            {label}
          </button>
        ))}
        <button
          onClick={onRemove}
          className="border border-border px-2 py-0.5 text-[10.5px] text-muted-foreground/40 hover:border-destructive hover:text-destructive"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
