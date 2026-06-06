import { Link } from "@tanstack/react-router";
import type { UserProfile } from "@/lib/api/auth.functions";

type Props = {
  name: string;
  profile: UserProfile | null;
  profileCompleteness: number;
  actionCount: number;
  deadlinesThisWeek: number;
  newOpportunityCount: number;
};

export function DashboardHero({
  name,
  profile,
  profileCompleteness,
  actionCount,
  deadlinesThisWeek,
  newOpportunityCount,
}: Props) {
  const profileSummary = [profile?.stage, profile?.sector, profile?.funding_status]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[13px] text-muted-foreground">Founder Dashboard</div>
            <h1 className="mt-1 font-serif text-[40px] leading-tight md:text-[52px]">
              Welcome back, <em className="italic text-primary">{name}</em>.
            </h1>
            {profileSummary && (
              <p className="mt-2 text-[14px] text-foreground/70">{profileSummary}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-muted-foreground">
              {actionCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary" />
                  {actionCount} actions recommended this week
                </span>
              )}
              {deadlinesThisWeek > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {deadlinesThisWeek} deadline{deadlinesThisWeek !== 1 ? "s" : ""} approaching
                </span>
              )}
              {newOpportunityCount > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {newOpportunityCount} new opportunities matched
                </span>
              )}
            </div>
          </div>

          <div className="w-full shrink-0 border border-border bg-card p-5 md:w-56">
            <div className="flex items-baseline justify-between">
              <span className="text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">
                Profile
              </span>
              <span className="font-serif text-[24px] leading-none">{profileCompleteness}%</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            <p className="mt-2 text-[11.5px] text-muted-foreground">
              {profileCompleteness < 100
                ? "Complete profile to unlock better recommendations."
                : "Profile complete."}
            </p>
            <Link
              to="/profile"
              className="mt-2 inline-block text-[12px] text-primary hover:underline"
            >
              Edit profile →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
