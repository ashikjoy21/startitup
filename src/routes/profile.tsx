import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { SiteLayout } from "@/components/site-layout";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { LocationPicker } from "@/components/location-picker";
import { loadProfile, upsertProfile } from "@/lib/api/auth.functions";
import { clearDismissedRecommendations } from "@/lib/profile-fingerprint";
import {
  PROFILE_FUNDING_STATUSES,
  PROFILE_SECTORS,
  PROFILE_STAGES,
} from "@/lib/profile-form-options";
const FUNDING_RAISED_OPTIONS = [
  "None yet",
  "Under ₹10L",
  "₹10L–₹50L",
  "₹50L–₹1Cr",
  "₹1Cr–₹5Cr",
  "₹5Cr+",
];

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — StartItUp.in" }] }),
  loader: async () => {
    const result = await loadProfile();
    if (!result.authenticated) throw redirect({ to: "/login", search: { redirect: "/profile" } });
    return { profile: result.profile };
  },
  component: Profile,
});

function Profile() {
  const { profile } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();

  const [startupName, setStartupName] = useState(profile?.startup_name ?? "");
  const [stage, setStage] = useState(profile?.stage ?? "");
  const [sector, setSector] = useState(profile?.sector ?? "");
  const [fundingStatus, setFundingStatus] = useState(profile?.funding_status ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [teamSize, setTeamSize] = useState(
    profile?.team_size != null ? String(profile.team_size) : "",
  );
  const [fundingRaised, setFundingRaised] = useState(profile?.funding_raised ?? "");
  const [incorporated, setIncorporated] = useState(profile?.incorporated ?? false);
  const [dpiitRecognized, setDpiitRecognized] = useState(profile?.dpiit_recognized ?? false);
  const [womenLed, setWomenLed] = useState(profile?.women_led ?? false);
  const [studentLed, setStudentLed] = useState(profile?.student_led ?? false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await upsertProfile({
        data: {
          stage,
          sector,
          fundingStatus,
          startupName: startupName || undefined,
          location: location || undefined,
          teamSize: teamSize ? Number(teamSize) : undefined,
          fundingRaised: fundingRaised || undefined,
          incorporated,
          dpiitRecognized,
          womenLed,
          studentLed,
        },
      });
      clearDismissedRecommendations();
      await router.invalidate();
      setSaved(true);
      timerRef.current = setTimeout(
        () => navigate({ to: "/dashboard", search: { tab: "matches" } }),
        800,
      );
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full border border-border bg-background px-3 py-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-primary";
  const selectClass = inputClass;
  const labelClass = "block text-[12.5px] font-medium text-muted-foreground";

  return (
    <SiteLayout>
      <DashboardNav active="profile" />
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="text-[13px] text-muted-foreground">Profile</div>
          <h1 className="mt-2 font-serif text-[44px] leading-tight md:text-[56px]">
            Your founder profile
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        <form onSubmit={handleSubmit} className="max-w-md space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="startupName" className={labelClass}>
              Startup Name
            </label>
            <input
              id="startupName"
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="e.g. Acme Labs"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stage" className={labelClass}>
              Stage <span className="text-destructive">*</span>
            </label>
            <select
              id="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className={selectClass}
            >
              <option value="">Select stage</option>
              {PROFILE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sector" className={labelClass}>
              Industry / Sector <span className="text-destructive">*</span>
            </label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className={selectClass}
            >
              <option value="">Select sector</option>
              {PROFILE_SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fundingStatus" className={labelClass}>
              Funding Status <span className="text-destructive">*</span>
            </label>
            <select
              id="fundingStatus"
              value={fundingStatus}
              onChange={(e) => setFundingStatus(e.target.value)}
              className={selectClass}
            >
              <option value="">Select status</option>
              {PROFILE_FUNDING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <LocationPicker value={location} onChange={setLocation} selectClass={selectClass} />

          <div className="space-y-1.5">
            <label htmlFor="teamSize" className={labelClass}>
              Team Size
            </label>
            <input
              id="teamSize"
              type="number"
              min="1"
              max="9999"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="e.g. 3"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fundingRaised" className={labelClass}>
              Funding Raised
            </label>
            <select
              id="fundingRaised"
              value={fundingRaised}
              onChange={(e) => setFundingRaised(e.target.value)}
              className={selectClass}
            >
              <option value="">Select range</option>
              {FUNDING_RAISED_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <span className={labelClass}>Company Details</span>
            <label htmlFor="incorporated" className="flex cursor-pointer items-center gap-3">
              <input
                id="incorporated"
                type="checkbox"
                checked={incorporated}
                onChange={(e) => setIncorporated(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="text-[14px]">Incorporated</span>
            </label>
            <label htmlFor="dpiitRecognized" className="flex cursor-pointer items-center gap-3">
              <input
                id="dpiitRecognized"
                type="checkbox"
                checked={dpiitRecognized}
                onChange={(e) => setDpiitRecognized(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="text-[14px]">DPIIT Recognized</span>
            </label>
            <label htmlFor="womenLed" className="flex cursor-pointer items-center gap-3">
              <input
                id="womenLed"
                type="checkbox"
                checked={womenLed}
                onChange={(e) => setWomenLed(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="text-[14px]">Women-led startup</span>
            </label>
            <label htmlFor="studentLed" className="flex cursor-pointer items-center gap-3">
              <input
                id="studentLed"
                type="checkbox"
                checked={studentLed}
                onChange={(e) => setStudentLed(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="text-[14px]">Student-led startup</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving || !stage || !sector || !fundingStatus}
            className="bg-primary px-6 py-2.5 text-[13.5px] font-medium text-primary-foreground disabled:opacity-50 hover:opacity-90"
          >
            {saved ? "Saved! Redirecting…" : saving ? "Saving…" : "Save profile"}
          </button>
          {saveError && <p className="text-[13px] text-destructive">{saveError}</p>}
          <p className="text-[12.5px] text-muted-foreground">
            Matches update automatically when you save. View them on{" "}
            <Link to="/dashboard" search={{ tab: "matches" }} className="text-primary hover:underline">
              Dashboard → Matches
            </Link>
            .
          </p>
        </form>
      </section>
    </SiteLayout>
  );
}
