import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/calculator")({
  head: () => ({ meta: [{ title: "Credit Calculator — StartItUp" }] }),
  component: Calculator,
});

const USD_TO_INR = 84;

type Stage = "Idea" | "Pre-Seed" | "Seed" | "Series A";

interface Program {
  name: string;
  category: string;
  usdByStage: Partial<Record<Stage, number>>;
  perSeat?: boolean;
  industries?: string[];
  note?: string;
}

// Real program credit amounts sourced from official provider pages (USD)
const PROGRAMS: Program[] = [
  {
    name: "AWS Activate",
    category: "Cloud",
    usdByStage: { Idea: 1000, "Pre-Seed": 5000, Seed: 100000, "Series A": 100000 },
    note: "Founders tier at Idea/Pre-Seed; Portfolio tier (requires VC/accelerator) at Seed+",
  },
  {
    name: "Google Cloud for Startups",
    category: "Cloud",
    usdByStage: { Idea: 2000, "Pre-Seed": 10000, Seed: 200000, "Series A": 200000 },
    note: "Up to $200k over 2 years for qualifying startups",
  },
  {
    name: "Microsoft Azure for Startups",
    category: "Cloud",
    usdByStage: { Idea: 1000, "Pre-Seed": 5000, Seed: 150000, "Series A": 150000 },
    note: "Via Microsoft for Startups Founders Hub",
  },
  {
    name: "HubSpot for Startups",
    category: "CRM & Marketing",
    usdByStage: { Idea: 6480, "Pre-Seed": 6480, Seed: 6480 },
    note: "90% off Professional ($7,200/yr) for startups with < $2M raised",
  },
  {
    name: "Stripe Fee Waiver",
    category: "Payments",
    usdByStage: { Idea: 25000, "Pre-Seed": 25000, Seed: 25000, "Series A": 25000 },
    note: "$25k in fee-free processing via Stripe Atlas program",
  },
  {
    name: "GitHub for Startups",
    category: "Dev Tools",
    usdByStage: { Idea: 48, "Pre-Seed": 48, Seed: 48, "Series A": 48 },
    perSeat: true,
    note: "Free Team plan ($4/user/month) — scales with team size",
  },
  {
    name: "Intercom Early Stage",
    category: "Customer Support",
    usdByStage: { Idea: 1188, "Pre-Seed": 1188, Seed: 1188 },
    note: "95% off for startups with < $1M raised (~$1,250/yr value)",
  },
  {
    name: "Notion for Startups",
    category: "Productivity",
    usdByStage: { Idea: 240, "Pre-Seed": 240, Seed: 240, "Series A": 240 },
    note: "Free Plus plan for 6 months",
  },
  {
    name: "MongoDB Atlas Credits",
    category: "Database",
    usdByStage: { Idea: 500, "Pre-Seed": 500, Seed: 500, "Series A": 500 },
  },
  {
    name: "Twilio Credits",
    category: "Communications",
    usdByStage: { Idea: 500, "Pre-Seed": 500, Seed: 500, "Series A": 500 },
  },
  {
    name: "Cloudflare for Startups",
    category: "Infrastructure",
    usdByStage: { Idea: 250, "Pre-Seed": 250, Seed: 250, "Series A": 250 },
    note: "$250/year in Cloudflare Pro credits",
  },
  // AI/ML-specific
  {
    name: "NVIDIA Inception",
    category: "AI/ML",
    usdByStage: { Idea: 2000, "Pre-Seed": 3000, Seed: 5000, "Series A": 5000 },
    industries: ["AI/ML"],
    note: "GPU cloud credits for AI startups via NVIDIA Inception program",
  },
  {
    name: "OpenAI for Startups",
    category: "AI/ML",
    usdByStage: { Idea: 1000, "Pre-Seed": 1000, Seed: 2500, "Series A": 2500 },
    industries: ["AI/ML"],
    note: "API credits via OpenAI's startup program",
  },
  {
    name: "Hugging Face Pro",
    category: "AI/ML",
    usdByStage: { Idea: 300, "Pre-Seed": 300, Seed: 300, "Series A": 300 },
    industries: ["AI/ML"],
    note: "Free Pro access for qualifying AI startups",
  },
  // Fintech-specific
  {
    name: "Razorpay Rize",
    category: "Fintech",
    usdByStage: { Idea: 600, "Pre-Seed": 600, Seed: 600, "Series A": 600 },
    industries: ["Fintech"],
    note: "Perks including API credits and fee waivers for Indian fintech startups",
  },
  {
    name: "Setu API Credits",
    category: "Fintech",
    usdByStage: { Idea: 500, "Pre-Seed": 500, Seed: 500, "Series A": 500 },
    industries: ["Fintech"],
    note: "Free API access for Indian fintech builders",
  },
  // Biotech-specific
  {
    name: "AWS Healthcare Program",
    category: "Healthcare",
    usdByStage: { Seed: 25000, "Series A": 25000 },
    industries: ["Biotech/Health"],
    note: "Additional cloud credits for digital health and biotech startups",
  },
];

const INDUSTRIES = ["SaaS", "AI/ML", "Fintech", "Deep Tech", "Consumer", "Biotech/Health"];
const STAGES: Stage[] = ["Idea", "Pre-Seed", "Seed", "Series A"];

function fmt(inr: number) {
  if (inr >= 10000000) return `₹${(inr / 10000000).toFixed(1)}Cr`;
  if (inr >= 100000) return `₹${(inr / 100000).toFixed(1)}L`;
  return `₹${inr.toLocaleString("en-IN")}`;
}

function Calculator() {
  const [industry, setIndustry] = useState("SaaS");
  const [stage, setStage] = useState<Stage>("Seed");
  const [team, setTeam] = useState(5);

  const breakdown = useMemo(() => {
    return PROGRAMS
      .filter(p => {
        if (p.industries && !p.industries.includes(industry)) return false;
        return stage in p.usdByStage;
      })
      .map(p => {
        const usd = (p.usdByStage[stage] ?? 0) * (p.perSeat ? Math.max(1, team) : 1);
        return { name: p.name, category: p.category, inr: Math.round(usd * USD_TO_INR), note: p.note };
      })
      .sort((a, b) => b.inr - a.inr);
  }, [industry, stage, team]);

  const total = useMemo(() => breakdown.reduce((s, p) => s + p.inr, 0), [breakdown]);

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[860px] px-6 py-20 text-center">
          <div className="text-[13px] text-muted-foreground">Credit Calculator</div>
          <h1 className="mt-2 font-serif text-[48px] leading-[1.05] md:text-[64px]">
            How much startup credit can you <em className="italic text-primary">claim?</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] text-foreground/75">
            Estimated based on real credit amounts from AWS, Google Cloud, Azure, Stripe, HubSpot, and other partner programs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[860px] px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <SelectField label="Industry" value={industry} setValue={setIndustry} options={INDUSTRIES} />
          <SelectField label="Stage" value={stage} setValue={(v) => setStage(v as Stage)} options={STAGES} />
          <label className="block">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Team Size</span>
            <input
              type="number"
              value={team}
              min={1}
              max={200}
              onChange={(e) => setTeam(Math.max(1, parseInt(e.target.value || "1", 10)))}
              className="mt-2 block h-11 w-full border border-border bg-card px-3 text-[14px] outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-12 border border-border bg-card p-10 text-center">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Estimated Credits Available
          </div>
          <div className="mt-4 font-serif text-[72px] leading-none text-primary md:text-[96px]">
            {fmt(total)}
          </div>
          <p className="mx-auto mt-4 max-w-md text-[13px] text-muted-foreground">
            Across {breakdown.length} programs · USD converted at ₹{USD_TO_INR}/$ · Amounts are maximums; eligibility varies by program
          </p>
        </div>

        <div className="mt-10">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Program Breakdown
          </div>
          <div className="divide-y divide-border border border-border">
            {breakdown.map(p => (
              <div key={p.name} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <div className="text-[14px] font-medium">{p.name}</div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">{p.category}</div>
                  {p.note && <div className="mt-1 text-[11.5px] text-muted-foreground/70 max-w-[500px]">{p.note}</div>}
                </div>
                <div className="shrink-0 font-serif text-[18px] text-primary">{fmt(p.inr)}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-[12px] text-muted-foreground/60">
          * Cloud credits at Seed/Series A tier require backing from a participating VC or accelerator. All figures are estimates based on publicly available program terms and may change. Verify eligibility on each provider's official page before applying.
        </p>
      </section>
    </SiteLayout>
  );
}

function SelectField({
  label, value, setValue, options,
}: { label: string; value: string; setValue: (v: string) => void; options: readonly string[] }) {
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
