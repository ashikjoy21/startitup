import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Founder Profile — StartItUp.in" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [done, setDone] = useState(false);

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[760px] px-6 py-16 text-center">
          <div className="text-[13px] text-muted-foreground">Founder Profile</div>
          <h1 className="mt-2 font-serif text-[44px] leading-tight md:text-[56px]">
            Tell us about your <em className="italic text-primary">startup</em>.
          </h1>
          <p className="mt-4 text-[15px] text-foreground/75">
            We use this to recommend the most relevant credits, grants and programs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[760px] px-6 py-12">
        {done ? (
          <div className="border border-border bg-card p-8 text-center">
            <h2 className="font-serif text-[28px]">Profile saved.</h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              We've personalized your dashboard.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex h-10 items-center bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark"
            >
              Go to dashboard →
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="space-y-6"
          >
            <Field label="Startup Name" placeholder="Acme Inc." />
            <Row>
              <Select label="Industry" options={["SaaS", "AI", "Biotech", "Deep Tech", "Fintech", "Consumer"]} />
              <Select label="Stage" options={["Idea", "Pre-Seed", "Seed", "Series A", "Growth"]} />
            </Row>
            <Row>
              <Field label="Location" placeholder="Bangalore, India" />
              <Field label="Team Size" placeholder="5" />
            </Row>
            <Field label="Tech Stack" placeholder="Next.js, Postgres, AWS" />
            <Select label="Funding Status" options={["Bootstrapped", "Angel", "Pre-Seed", "Seed", "Series A+"]} />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex h-11 items-center bg-primary px-5 text-[14px] font-medium text-primary-foreground hover:bg-primary-dark"
              >
                Save Profile
              </button>
              <Link to="/opportunities" className="text-[13.5px] text-muted-foreground hover:text-primary">
                Skip for now
              </Link>
            </div>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 md:grid-cols-2">{children}</div>;
}
function Field({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        placeholder={placeholder}
        className="mt-2 block h-11 w-full border border-border bg-card px-3 text-[14px] outline-none focus:border-primary"
      />
    </label>
  );
}
function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select className="mt-2 block h-11 w-full border border-border bg-card px-3 text-[14px] outline-none focus:border-primary">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}
