import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { listOpportunities, submitOpportunitySuggestion } from "@/lib/api/opportunities.functions";
import { defaultCategories } from "@/lib/opportunities";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Suggest an Opportunity — StartItUp" },
      {
        name: "description",
        content: "Help the community by suggesting a startup grant, credit, or program.",
      },
    ],
  }),
  loader: () => listOpportunities({ data: { limit: 1, offset: 0 } }),
  component: SubmitPage,
});

function SubmitPage() {
  const { categories, source } = Route.useLoaderData();
  const cats = categories.length ? categories : [...defaultCategories];
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    org: "",
    short: "",
    description: "",
    category: cats[0] ?? "Grants",
    industry: "All",
    stage: "Any",
    location: "India",
    amount: "",
    deadline: "Rolling",
    eligibility: "",
    sourceUrl: "",
    submitterName: "",
    submitterEmail: "",
    notes: "",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const result = await submitOpportunitySuggestion({
        data: {
          submissionType: "new",
          name: form.name,
          org: form.org || undefined,
          short: form.short || undefined,
          description: form.description || undefined,
          category: form.category || undefined,
          industry: form.industry || undefined,
          stage: form.stage || undefined,
          location: form.location || undefined,
          amount: form.amount || undefined,
          deadline: form.deadline || undefined,
          eligibility: form.eligibility || undefined,
          sourceUrl: form.sourceUrl || undefined,
          submitterName: form.submitterName || undefined,
          submitterEmail: form.submitterEmail || undefined,
          notes: form.notes || undefined,
        },
      });
      setMessage(result.message);
      setStatus("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Submission failed");
      setStatus("error");
    }
  };

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[720px] px-6 py-16">
          <div className="text-[13px] text-muted-foreground">Community contribution</div>
          <h1 className="mt-2 font-serif text-[44px] leading-tight">Suggest an opportunity</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/75">
            Found a grant, accelerator, or startup credit program? Submit it for review. Approved
            listings go live on StartItUp — the dataset stays on the platform, not as a public
            download.
          </p>
          {source === "seed" && (
            <p className="mt-3 text-[13px] text-amber-700">
              Supabase not connected — submissions work in demo mode only.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[720px] px-6 py-12">
        {status === "done" ? (
          <div className="border border-border bg-card p-8 text-center">
            <h2 className="font-serif text-[28px]">Thank you!</h2>
            <p className="mt-3 text-[14px] text-foreground/80">{message}</p>
            <Link to="/opportunities" className="mt-6 inline-block text-primary hover:underline">
              Browse opportunities →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Program name *">
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Organization">
              <input value={form.org} onChange={(e) => set("org", e.target.value)} className={inputCls} />
            </Field>
            <Field label="One-line summary">
              <input value={form.short} onChange={(e) => set("short", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Official link">
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(e) => set("sourceUrl", e.target.value)}
                placeholder="https://"
                className={inputCls}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={inputCls}
                >
                  {cats.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Amount / benefit">
                <input value={form.amount} onChange={(e) => set("amount", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Stage">
                <input value={form.stage} onChange={(e) => set("stage", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Deadline">
                <input value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Eligibility">
              <textarea
                rows={3}
                value={form.eligibility}
                onChange={(e) => set("eligibility", e.target.value)}
                className={inputCls}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Your name">
                <input
                  value={form.submitterName}
                  onChange={(e) => set("submitterName", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Your email">
                <input
                  type="email"
                  value={form.submitterEmail}
                  onChange={(e) => set("submitterEmail", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Notes for reviewers">
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className={inputCls}
              />
            </Field>

            {status === "error" && (
              <p className="text-[13px] text-destructive">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="h-11 bg-primary px-6 text-[14px] font-medium text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
            >
              {status === "loading" ? "Submitting…" : "Submit for review"}
            </button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}

const inputCls =
  "h-10 w-full border border-border bg-card px-3 text-[14px] outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}
