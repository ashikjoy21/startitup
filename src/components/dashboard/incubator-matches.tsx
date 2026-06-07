import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { ScoredMatch, UserProfile } from "@/lib/api/auth.functions";
import { STRENGTH_LABEL, STRENGTH_COLOR, STRENGTH_BG } from "@/lib/matching";

const CATEGORY_ORDER = [
  "Accelerators",
  "Incubators",
  "Grants",
  "Government Schemes",
  "Investor Programs",
  "Startup Credits",
  "Fellowships",
  "Competitions",
];

const STRENGTH_ORDER = ["excellent", "strong", "good", "moderate", "weak"] as const;

type Props = {
  matches: ScoredMatch[];
  profile: UserProfile | null;
};

function FilterGroup({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: { label: string; count: number }[];
}) {
  return (
    <div>
      <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul className="space-y-1.5">
        {options.map((o) => (
          <li key={o.label}>
            <button
              onClick={() => setValue(o.label)}
              className={
                "flex w-full items-center justify-between text-[13.5px] " +
                (value === o.label
                  ? "text-primary underline underline-offset-2"
                  : "text-foreground/80 hover:text-primary")
              }
            >
              <span>{o.label}</span>
              <span className="text-[11px] text-muted-foreground">{o.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchCard({ m }: { m: ScoredMatch }) {
  return (
    <div className={`border p-5 ${STRENGTH_BG[m.matchStrength]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {m.category}
          </p>
          <h3 className="mt-0.5 font-serif text-[17px] leading-snug">{m.name}</h3>
          <p className="mt-0.5 text-[12.5px] text-foreground/60">{m.org}</p>
        </div>

        <div className="shrink-0 text-right">
          <div className={`font-serif text-[30px] leading-none ${STRENGTH_COLOR[m.matchStrength]}`}>
            {m.matchScore}
          </div>
          <div className="text-[10px] text-muted-foreground">% match</div>
        </div>
      </div>

      <div className="mt-1.5">
        <span
          className={`text-[10.5px] font-semibold uppercase tracking-wide ${STRENGTH_COLOR[m.matchStrength]}`}
        >
          {STRENGTH_LABEL[m.matchStrength]}
        </span>
      </div>

      {m.matchReasons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {m.matchReasons.map((r) => (
            <span
              key={r.label}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-background/70 px-2 py-0.5 text-[10.5px] text-foreground/75"
            >
              <span className="text-emerald-600">✓</span>
              {r.detail}
            </span>
          ))}
        </div>
      )}

      {m.matchPenalties.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {m.matchPenalties.map((r) => (
            <span
              key={r.label}
              className="inline-flex items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] text-amber-700"
            >
              ⚠ {r.detail}
            </span>
          ))}
        </div>
      )}

      {m.amount && m.amount !== "—" && (
        <p className="mt-2.5 text-[12px] font-medium text-emerald-600">{m.amount}</p>
      )}
      {m.location && m.location !== "—" && (
        <p className="text-[11.5px] text-muted-foreground">{m.location}</p>
      )}
      {m.deadline && m.deadline !== "—" && (
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">Deadline: {m.deadline}</p>
      )}

      <div className="mt-4 flex gap-2">
        {m.sourceUrl && (
          <a
            href={m.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary px-3.5 py-1.5 text-[12.5px] font-medium text-primary-foreground hover:opacity-90"
          >
            Apply
          </a>
        )}
        <Link
          to="/opportunities/$id"
          params={{ id: m.id }}
          className="border border-border bg-background/70 px-3.5 py-1.5 text-[12.5px] text-foreground/80 hover:border-primary hover:text-primary"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function buildCategoryOptions(pool: ScoredMatch[]) {
  const counts = new Map<string, number>();
  for (const m of pool) {
    counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
  }
  const ordered = CATEGORY_ORDER.filter((c) => counts.has(c)).map((c) => ({
    label: c,
    count: counts.get(c)!,
  }));
  for (const [cat, count] of counts) {
    if (!CATEGORY_ORDER.includes(cat)) ordered.push({ label: cat, count });
  }
  return [{ label: "All", count: pool.length }, ...ordered];
}

function buildStrengthOptions(pool: ScoredMatch[]) {
  const counts = new Map<string, number>();
  for (const m of pool) counts.set(m.matchStrength, (counts.get(m.matchStrength) ?? 0) + 1);
  const ordered = STRENGTH_ORDER.filter((s) => counts.has(s)).map((s) => ({
    label: STRENGTH_LABEL[s],
    count: counts.get(s)!,
    key: s,
  }));
  return [{ label: "All", count: pool.length, key: "All" }, ...ordered];
}

export function IncubatorMatches({ matches, profile }: Props) {
  const [activeCat, setActiveCat] = useState("All");
  const [activeStrength, setActiveStrength] = useState("All");

  // Faceted counts: each filter group reflects the other active filter
  const poolForCategoryCounts = useMemo(() => {
    if (activeStrength === "All") return matches;
    return matches.filter((m) => STRENGTH_LABEL[m.matchStrength] === activeStrength);
  }, [matches, activeStrength]);

  const poolForStrengthCounts = useMemo(() => {
    if (activeCat === "All") return matches;
    return matches.filter((m) => m.category === activeCat);
  }, [matches, activeCat]);

  const categoryOptions = useMemo(
    () => buildCategoryOptions(poolForCategoryCounts),
    [poolForCategoryCounts],
  );

  const strengthOptions = useMemo(
    () => buildStrengthOptions(poolForStrengthCounts),
    [poolForStrengthCounts],
  );

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (activeCat !== "All" && m.category !== activeCat) return false;
      if (activeStrength !== "All" && STRENGTH_LABEL[m.matchStrength] !== activeStrength)
        return false;
      return true;
    });
  }, [matches, activeCat, activeStrength]);

  const profileIncomplete = !profile?.sector || !profile?.stage;

  if (matches.length === 0) {
    return (
      <div>
        <h2 className="font-serif text-[28px]">Your Matches</h2>
        <div className="mt-4 border border-border bg-card px-6 py-12 text-center">
          <p className="text-[14px] text-muted-foreground">
            {profileIncomplete ? (
              <>
                Complete your profile to see matches.{" "}
                <Link to="/profile" className="text-primary hover:underline">
                  Edit profile →
                </Link>
              </>
            ) : (
              "No matches found for your profile yet."
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-[28px]">Your Matches</h2>
        <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-muted-foreground">
          <span>
            Scored by stage, sector{profile?.location ? ", location" : ""}
            {profile?.dpiit_recognized ? " & eligibility" : ""}
          </span>
          <Link to="/profile" className="text-primary hover:underline">
            Edit profile
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-8">
          <FilterGroup
            label="Category"
            value={activeCat}
            setValue={setActiveCat}
            options={categoryOptions}
          />
          <FilterGroup
            label="Match Strength"
            value={activeStrength}
            setValue={setActiveStrength}
            options={strengthOptions.map((s) => ({ label: s.label, count: s.count }))}
          />
        </aside>

        <div>
          <div className="mb-4 text-[13px] text-muted-foreground">
            {filtered.length} match{filtered.length !== 1 ? "es" : ""}
            {activeCat !== "All" || activeStrength !== "All" ? (
              <button
                onClick={() => {
                  setActiveCat("All");
                  setActiveStrength("All");
                }}
                className="ml-3 text-primary hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <div className="border border-border bg-card p-10 text-center text-[14px] text-muted-foreground">
              No matches for these filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((m) => (
                <MatchCard key={m.id} m={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
