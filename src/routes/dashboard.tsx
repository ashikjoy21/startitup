import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { loadDashboard } from "@/lib/api/auth.functions";
import { DashboardNav, type DashboardTab } from "@/components/dashboard/dashboard-nav";
import { DashboardHero } from "@/components/dashboard/hero";
import { DashboardMetrics } from "@/components/dashboard/metrics";
import { ActionCenter } from "@/components/dashboard/action-center";
import { DeadlineWidget } from "@/components/dashboard/deadline-widget";
import { PipelineKanban } from "@/components/dashboard/pipeline";
import { IncubatorMatches } from "@/components/dashboard/incubator-matches";
import { ProfileCompletion } from "@/components/dashboard/profile-completion";
import { LoopTeaser } from "@/components/dashboard/loop-teaser";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Founder Dashboard — StartItUp.in" }] }),
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
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  if (!data.authenticated) return null;

  const {
    name,
    profile,
    profileCompleteness,
    savedCount,
    appliedCount,
    deadlinesThisWeek,
    newThisWeekCount,
    actionItems,
    pipeline,
    incubatorMatches,
    upcomingDeadlines,
  } = data;

  return (
    <SiteLayout>
      <DashboardHero
        name={name}
        profile={profile}
        profileCompleteness={profileCompleteness}
        actionCount={actionItems.length}
        deadlinesThisWeek={deadlinesThisWeek}
        newOpportunityCount={newThisWeekCount}
      />

      <DashboardNav active={activeTab} onChange={setActiveTab} />

      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <DashboardMetrics
          savedCount={savedCount}
          appliedCount={appliedCount}
          deadlinesThisWeek={deadlinesThisWeek}
          newThisWeekCount={newThisWeekCount}
        />

        {activeTab === "overview" && (
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-10">
              <ActionCenter items={actionItems} />
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
          <div className="mt-10 max-w-lg">
            <h2 className="font-serif text-[28px]">Deadline Calendar</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Upcoming deadlines across all published opportunities.
            </p>
            <div className="mt-6">
              <DeadlineWidget deadlines={upcomingDeadlines} />
            </div>
          </div>
        )}

        {activeTab === "matches" && (
          <div className="mt-10">
            <IncubatorMatches matches={incubatorMatches} profile={profile} />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
