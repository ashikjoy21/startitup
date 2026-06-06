import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { SiteLayout } from "@/components/site-layout";
import { getUser, getProfile } from "@/lib/auth.server";
import { upsertProfile } from "@/lib/api/auth.functions";

const STAGES = ["Idea", "MVP", "Early Traction", "Growth", "Series A+"];
const SECTORS = [
  "Agritech", "Climate/Cleantech", "D2C/Ecommerce", "DeepTech/AI", "Edtech",
  "Fintech", "Gaming", "Healthtech", "Media/Creator", "Mobility",
  "SaaS/B2B", "Social Impact", "Spacetech", "Web3", "Other",
];
const FUNDING_STATUSES = ["Bootstrapped", "Pre-seed", "Seed", "Series A", "Series B+"];

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — StartItUp.in" }] }),
  loader: async () => {
    const user = await getUser();
    if (!user) throw redirect({ to: "/login", search: { redirect: "/profile" } });
    const profile = await getProfile(user.id);
    return { profile };
  },
  component: Profile,
});

function Profile() {
  const { profile } = Route.useLoaderData();
  const navigate = useNavigate();

  const [stage, setStage] = useState(profile?.stage ?? "");
  const [sector, setSector] = useState(profile?.sector ?? "");
  const [fundingStatus, setFundingStatus] = useState(profile?.funding_status ?? "");
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
      await upsertProfile({ data: { stage, sector, fundingStatus } });
      setSaved(true);
      timerRef.current = setTimeout(() => navigate({ to: "/dashboard" }), 800);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "block text-[12.5px] font-medium text-muted-foreground";

  return (
    <SiteLayout>
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
            <label htmlFor="stage" className={labelClass}>Stage</label>
            <select id="stage" value={stage} onChange={(e) => setStage(e.target.value)} className={selectClass}>
              <option value="">Select stage</option>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sector" className={labelClass}>Sector</label>
            <select id="sector" value={sector} onChange={(e) => setSector(e.target.value)} className={selectClass}>
              <option value="">Select sector</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fundingStatus" className={labelClass}>Funding status</label>
            <select id="fundingStatus" value={fundingStatus} onChange={(e) => setFundingStatus(e.target.value)} className={selectClass}>
              <option value="">Select status</option>
              {FUNDING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving || !stage || !sector || !fundingStatus}
            className="rounded-sm bg-primary px-6 py-2.5 text-[13.5px] font-medium text-primary-foreground disabled:opacity-50"
          >
            {saved ? "Saved! Redirecting…" : saving ? "Saving…" : "Save profile"}
          </button>
          {saveError && (
            <p className="text-[13px] text-destructive">{saveError}</p>
          )}
        </form>
      </section>
    </SiteLayout>
  );
}
