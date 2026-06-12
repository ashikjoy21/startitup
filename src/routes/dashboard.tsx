import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { loadDashboard } from "@/lib/api/auth.functions";
import { profileMatchFingerprint } from "@/lib/profile-fingerprint";
import { DashboardNav, type DashboardTab } from "@/components/dashboard/dashboard-nav";
import { DashboardHero } from "@/components/dashboard/hero";
import { DashboardMetrics } from "@/components/dashboard/metrics";
import { ActionCenter } from "@/components/dashboard/action-center";
import { DeadlineCalendar } from "@/components/dashboard/deadline-calendar";
import { DeadlineWidget } from "@/components/dashboard/deadline-widget";
import { PipelineKanban } from "@/components/dashboard/pipeline";
import { IncubatorMatches } from "@/components/dashboard/incubator-matches";
import { ProfileCompletion } from "@/components/dashboard/profile-completion";
import { LoopTeaser } from "@/components/dashboard/loop-teaser";
import { SavedList } from "@/components/dashboard/saved-list";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Founder Dashboard — StartItUp" }] }),
  validateSearch: z.object({
    tab: z.enum(["overview", "pipeline", "calendar", "matches", "saved"]).optional(),
  }),
  loader: async () => {
    const data = await loadDashboard();
    if (!data.authenticated) {
      throw redirect({ to: "/login", search: { redirect: "/dashboard" } });
    }
    return data;
  },
  component: Dashboard,
});

function Dashboard() {
  const data = Route.useLoaderData();
  const { tab } = Route.useSearch();
  const activeTab: DashboardTab = tab ?? "overview";

  if (!data.authenticated) return null;

  const {
    name,
    profile,
    profileCompleteness,
    savedCount,
    appliedCount,
    deadlinesThisWeek,
    newThisWeekCount,
    actionRecommendedCount,
    potentialFundingInr,
    actionItems,
    pipeline,
    allMatches,
    upcomingDeadlines,
    calendarDeadlines,
  } = data;

  return (
    <SiteLayout>
      <DashboardHero
        name={name}
        profile={profile}
        profileCompleteness={profileCompleteness}
        actionCount={actionRecommendedCount}
        deadlinesThisWeek={deadlinesThisWeek}
        newOpportunityCount={newThisWeekCount}
      />

      <DashboardNav active={activeTab} />

      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <DashboardMetrics
          savedCount={savedCount}
          appliedCount={appliedCount}
          deadlinesThisWeek={deadlinesThisWeek}
          potentialFundingInr={potentialFundingInr}
        />

        {activeTab === "overview" && (
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-10">
              <ActionCenter
                items={actionItems}
                profileFingerprint={profileMatchFingerprint(profile)}
              />
              <LoopTeaser />
            </div>
            <div className="space-y-6">
              <DeadlineWidget deadlines={upcomingDeadlines} />
              <ProfileCompletion profile={profile} completeness={profileCompleteness} />
            </div>
          </div>
        )}

        {activeTab === "pipeline" && (
          <div className="mt-10">
            <PipelineKanban pipeline={pipeline} />
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="mt-10">
            <DeadlineCalendar deadlines={calendarDeadlines} />
          </div>
        )}

        {activeTab === "matches" && (
          <div className="mt-10">
            <IncubatorMatches matches={allMatches} profile={profile} />
          </div>
        )}

        {activeTab === "saved" && (
          <div className="mt-10">
            <SavedList items={pipeline.saved} />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
