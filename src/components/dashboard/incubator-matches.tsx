import { Link } from "@tanstack/react-router";
import type { IncubatorMatch, UserProfile } from "@/lib/api/auth.functions";

type Props = {
  matches: IncubatorMatch[];
  profile: UserProfile | null;
};

export function IncubatorMatches({ matches, profile }: Props) {
  if (matches.length === 0) {
    return (
      <div>
        <h2 className="font-serif text-[28px]">Incubator Matches</h2>
        <div className="mt-4 border border-border bg-card px-6 py-12 text-center">
          <p className="text-[14px] text-muted-foreground">
            No matches yet.{" "}
            <Link to="/profile" className="text-primary hover:underline">
              Complete your profile →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-[28px]">Incubator Matches</h2>
        <span className="text-[12.5px] text-muted-foreground">Matched by profile</span>
      </div>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        Scored by stage, sector
        {profile?.location ? ", and location" : ""}.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {matches.map((m) => {
          const sectorParts = profile?.sector
            ? profile.sector
                .toLowerCase()
                .split(/[/\s]+/)
                .filter(Boolean)
            : [];
          const reasons = [
            profile?.stage && m.stage.toLowerCase() === profile.stage.toLowerCase()
              ? profile.stage
              : null,
            sectorParts.length > 0 &&
            sectorParts.some((part) => m.industry.toLowerCase().includes(part))
              ? profile!.sector
              : null,
          ].filter((r): r is string => r !== null);

          return (
            <div key={m.id} className="border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {m.category}
                  </p>
                  <h3 className="mt-0.5 font-serif text-[17px] leading-snug">{m.name}</h3>
                  <p className="mt-0.5 text-[12.5px] text-foreground/60">{m.org}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-serif text-[30px] leading-none text-primary">
                    {m.matchScore}
                  </div>
                  <div className="text-[10px] text-muted-foreground">% match</div>
                </div>
              </div>

              <p className="mt-2 text-[12px] text-muted-foreground">
                Why matched:{" "}
                <span className="text-foreground/80">
                  {reasons.length > 0 ? reasons.join(", ") : "General fit"}
                </span>
              </p>

              {m.amount && m.amount !== "—" && (
                <p className="mt-1 text-[12px] text-emerald-600">{m.amount}</p>
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
                  className="border border-border px-3.5 py-1.5 text-[12.5px] text-foreground/80 hover:border-primary hover:text-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
