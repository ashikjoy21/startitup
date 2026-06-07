import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { saveOpportunity } from "@/lib/api/auth.functions";
import type { RecommendedOpportunity } from "@/lib/api/auth.functions";
import { STRENGTH_LABEL, STRENGTH_COLOR } from "@/lib/matching";
import { syncDismissedWithProfile } from "@/lib/profile-fingerprint";

type Props = {
  items: RecommendedOpportunity[];
  profileFingerprint: string;
};

export function ActionCenter({ items, profileFingerprint }: Props) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    syncDismissedWithProfile(profileFingerprint);
    try {
      const raw = localStorage.getItem("siu_dismissed_actions");
      setDismissed(new Set(raw ? (JSON.parse(raw) as string[]) : []));
    } catch {
      setDismissed(new Set());
    }
  }, [profileFingerprint]);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const visible = items.filter((o) => !dismissed.has(o.id));

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("siu_dismissed_actions", JSON.stringify([...next]));
      } catch {
        // localStorage unavailable — dismiss applied in memory only
      }
      return next;
    });
  }

  async function handleSave(id: string) {
    setSaving(id);
    setSaveError(null);
    try {
      await saveOpportunity({ data: { opportunityId: id } });
      await router.invalidate();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-[28px]">Recommended for You</h2>
        <span className="text-[12.5px] text-muted-foreground">{visible.length} matches</span>
      </div>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        Ranked by stage, sector, location, and eligibility fit.
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 border border-border bg-card px-6 py-12 text-center">
          <p className="text-[14px] text-muted-foreground">
            All caught up.{" "}
            <Link to="/opportunities" className="text-primary hover:underline">
              Browse all →
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {visible.map((o) => (
            <div key={o.id} className="flex flex-col border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {o.category}
                    </p>
                    {o.matchScore > 0 && (
                      <span className={`text-[10.5px] font-semibold ${STRENGTH_COLOR[o.matchStrength]}`}>
                        {o.matchScore}% · {STRENGTH_LABEL[o.matchStrength]}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-0.5 font-serif text-[17px] leading-snug">{o.name}</h3>
                  <p className="mt-0.5 text-[12.5px] text-foreground/60">{o.org}</p>
                </div>
                <button
                  onClick={() => dismiss(o.id)}
                  aria-label={`Dismiss ${o.name}`}
                  className="shrink-0 px-1 py-0.5 text-[11px] text-muted-foreground/40 hover:text-muted-foreground"
                >
                  ✕
                </button>
              </div>

              {o.matchReasons.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {o.matchReasons.slice(0, 4).map((r) => (
                    <span
                      key={r.label}
                      className="inline-flex items-center gap-1 rounded-sm border border-border bg-muted/60 px-2 py-0.5 text-[10.5px] text-foreground/70"
                    >
                      <span className="text-emerald-600">✓</span>
                      {r.detail}
                    </span>
                  ))}
                </div>
              )}

              {o.amount && o.amount !== "—" && (
                <p className="mt-3 text-[12.5px]">
                  <span className="text-muted-foreground">Potential: </span>
                  <span className="font-medium text-emerald-600">{o.amount}</span>
                </p>
              )}
              {o.deadline && o.deadline !== "—" && (
                <p className="mt-0.5 text-[12px] text-muted-foreground">Deadline: {o.deadline}</p>
              )}

              <div className="mt-auto flex items-center gap-2 pt-4">
                <button
                  onClick={() => handleSave(o.id)}
                  disabled={saving === o.id}
                  className="bg-primary px-3.5 py-1.5 text-[12.5px] font-medium text-primary-foreground disabled:opacity-50 hover:opacity-90"
                >
                  {saving === o.id ? "Saving…" : "Save"}
                </button>
                <Link
                  to="/opportunities/$id"
                  params={{ id: o.id }}
                  className="border border-border px-3.5 py-1.5 text-[12.5px] text-foreground/80 hover:border-primary hover:text-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {saveError && <p className="mt-2 text-[12.5px] text-destructive">{saveError}</p>}
    </div>
  );
}
