import { Link } from "@tanstack/react-router";
import type { UserProfile } from "@/lib/api/auth.functions";

const FIELDS: { key: keyof UserProfile; label: string }[] = [
  { key: "startup_name", label: "Startup Name" },
  { key: "stage", label: "Stage" },
  { key: "sector", label: "Industry / Sector" },
  { key: "funding_status", label: "Funding Status" },
  { key: "location", label: "Location" },
  { key: "team_size", label: "Team Size" },
  { key: "funding_raised", label: "Funding Raised" },
];

type Props = {
  profile: UserProfile | null;
  completeness: number;
};

export function ProfileCompletion({ profile, completeness }: Props) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-[20px]">Founder Profile</h3>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {completeness < 100
              ? "Complete your profile for better recommendations."
              : "Your profile is complete."}
          </p>
        </div>
        <div className="text-right">
          <div className="font-serif text-[32px] leading-none">{completeness}%</div>
          <div className="text-[11px] text-muted-foreground">complete</div>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${completeness}%` }}
        />
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {FIELDS.map(({ key, label }) => {
          const val = profile?.[key];
          const filled = val !== null && val !== undefined && val !== "";
          return (
            <li key={key} className="flex items-center gap-2 text-[12.5px]">
              <span
                className={[
                  "size-1.5 shrink-0 rounded-full",
                  filled ? "bg-emerald-500" : "bg-border",
                ].join(" ")}
              />
              <span className={filled ? "text-foreground" : "text-muted-foreground"}>{label}</span>
            </li>
          );
        })}
      </ul>

      <Link
        to="/profile"
        className="mt-4 inline-block bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
      >
        Edit Profile →
      </Link>
    </div>
  );
}
