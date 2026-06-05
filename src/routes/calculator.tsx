import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/calculator")({
  head: () => ({ meta: [{ title: "Credit Calculator — StartItUp.in" }] }),
  component: Calculator,
});

const industryMult: Record<string, number> = { SaaS: 1.4, AI: 1.8, Biotech: 1.2, "Deep Tech": 1.3, Consumer: 1, Fintech: 1.1 };
const stageMult: Record<string, number> = { Idea: 0.5, "Pre-Seed": 1, Seed: 1.6, "Series A": 2.2 };

function Calculator() {
  const [industry, setIndustry] = useState("SaaS");
  const [stage, setStage] = useState("Seed");
  const [team, setTeam] = useState(5);

  const credits = useMemo(() => {
    const base = 500000;
    return Math.round(base * (industryMult[industry] ?? 1) * (stageMult[stage] ?? 1) * Math.max(1, Math.min(team, 50)) / 1) ;
  }, [industry, stage, team]);

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[860px] px-6 py-20 text-center">
          <div className="text-[13px] text-muted-foreground">Credit Calculator</div>
          <h1 className="mt-2 font-serif text-[48px] leading-[1.05] md:text-[64px]">
            How much startup credit can you <em className="italic text-primary">claim?</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] text-foreground/75">
            Cloud credits, software perks, and program grants — estimated based on your profile.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[860px] px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Select label="Industry" value={industry} setValue={setIndustry} options={Object.keys(industryMult)} />
          <Select label="Stage" value={stage} setValue={setStage} options={Object.keys(stageMult)} />
          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Team Size</span>
            <input
              type="number"
              value={team}
              min={1}
              onChange={(e) => setTeam(parseInt(e.target.value || "1", 10))}
              className="mt-2 block h-11 w-full border border-border bg-card px-3 text-[14px] outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-12 border border-border bg-card p-10 text-center">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            Estimated Available Credits
          </div>
          <div className="mt-4 font-serif text-[72px] leading-none text-primary md:text-[96px]">
            ₹{credits.toLocaleString("en-IN")}
          </div>
          <p className="mx-auto mt-6 max-w-md text-[13.5px] text-muted-foreground">
            Based on AWS, Azure, Google Cloud, Stripe, Notion, HubSpot and ~40 other partner programs.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function Select({
  label, value, setValue, options,
}: { label: string; value: string; setValue: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-2 block h-11 w-full border border-border bg-card px-3 text-[14px] outline-none focus:border-primary"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
