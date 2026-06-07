import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { fetchSessionUser, upsertProfile } from "@/lib/api/auth.functions";
import { clearDismissedRecommendations } from "@/lib/profile-fingerprint";

const STAGES = ["Idea", "Pre-Seed", "Seed", "Series A", "Growth"] as const;
const SECTORS = [
  "AI/ML", "SaaS", "FinTech", "HealthTech", "EdTech",
  "DeepTech", "Consumer", "AgriTech", "CleanTech", "Other",
] as const;
const FUNDING_STATUSES = [
  "Bootstrapped", "Angel-Funded", "Pre-Seed", "Seed", "Series A+",
] as const;

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set Up Your Profile — StartItUp.in" }] }),
  loader: async () => {
    const user = await fetchSessionUser();
    if (!user) throw redirect({ to: "/login", search: { redirect: "/onboarding" } });
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const router = useRouter();
  const [stage, setStage] = useState("");
  const [sector, setSector] = useState("");
  const [fundingStatus, setFundingStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stage || !sector || !fundingStatus) return;
    setSaving(true);
    try {
      await upsertProfile({ data: { stage, sector, fundingStatus } });
      clearDismissedRecommendations();
      await router.invalidate();
      router.navigate({ to: "/dashboard" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[760px] px-6 py-16 text-center">
          <div className="text-[13px] text-muted-foreground">Quick setup</div>
          <h1 className="mt-2 font-serif text-[44px] leading-tight">
            Tell us about your <em className="italic text-primary">startup</em>.
          </h1>
          <p className="mt-4 text-[15px] text-foreground/75">
            Three quick answers — we'll surface the most relevant opportunities for you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[760px] px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <SelectField
            label="Stage"
            value={stage}
            onChange={setStage}
            options={STAGES}
            placeholder="What stage is your startup?"
          />
          <SelectField
            label="Sector"
            value={sector}
            onChange={setSector}
            options={SECTORS}
            placeholder="What sector are you in?"
          />
          <SelectField
            label="Funding Status"
            value={fundingStatus}
            onChange={setFundingStatus}
            options={FUNDING_STATUSES}
            placeholder="What's your current funding status?"
          />

          <button
            type="submit"
            disabled={!stage || !sector || !fundingStatus || saving}
            className="inline-flex h-11 items-center bg-primary px-5 text-[14px] font-medium text-primary-foreground hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? "Saving…" : "Go to Dashboard →"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-2 block h-11 w-full border border-border bg-card px-3 text-[14px] outline-none focus:border-primary"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
