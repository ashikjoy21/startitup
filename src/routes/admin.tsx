import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import {
  useOpportunitiesStore,
  upsertOpportunity,
  deleteOpportunity,
  setCategories,
  resetToDefaults,
  slugify,
  type Opportunity,
} from "@/lib/opportunities-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — StartItUp" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const emptyOpp: Opportunity = {
  id: "",
  name: "",
  org: "",
  short: "",
  description: "",
  category: "",
  industry: "",
  stage: "",
  location: "",
  amount: "",
  deadline: "",
  eligibility: "",
  logo: "",
};

function AdminPage() {
  const { items, categories } = useOpportunitiesStore();
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [tab, setTab] = useState<"opps" | "cats">("opps");
  const [q, setQ] = useState("");
  const [catInput, setCatInput] = useState(categories.join(", "));

  const filtered = useMemo(
    () =>
      items.filter((o) =>
        !q ? true : `${o.name} ${o.org} ${o.category}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [items, q],
  );

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-[1280px] items-end justify-between px-6 py-12">
          <div>
            <div className="text-[13px] text-muted-foreground">Admin Panel</div>
            <h1 className="mt-2 font-serif text-[44px] leading-tight">Manage Opportunities</h1>
            <p className="mt-2 max-w-2xl text-[14px] text-foreground/70">
              Create, edit, and delete opportunities, deadlines, categories, and eligibility
              criteria. Changes are saved locally to this browser.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm("Reset all opportunities and categories to defaults?")) {
                  resetToDefaults();
                  setCatInput("");
                  setEditing(null);
                }
              }}
              className="h-9 border border-border bg-background px-3 text-[13px] hover:bg-muted"
            >
              Reset to defaults
            </button>
            <button
              onClick={() => setEditing({ ...emptyOpp })}
              className="h-9 bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark"
            >
              + New opportunity
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-10">
        <div className="mb-6 flex gap-6 border-b border-border">
          {(["opps", "cats"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "-mb-px border-b-2 px-1 pb-3 text-[13.5px] " +
                (tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/70 hover:text-primary")
              }
            >
              {t === "opps" ? `Opportunities (${items.length})` : `Categories (${categories.length})`}
            </button>
          ))}
        </div>

        {tab === "opps" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_460px]">
            <div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search opportunities…"
                className="mb-4 h-10 w-full border border-border bg-card px-3 text-[14px] outline-none focus:border-primary"
              />
              <div className="border border-border bg-card">
                <table className="w-full text-[13.5px]">
                  <thead className="border-b border-border text-left text-[12px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Deadline</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{o.name}</div>
                          <div className="text-[12px] text-muted-foreground">{o.org}</div>
                        </td>
                        <td className="px-4 py-3 text-foreground/80">{o.category}</td>
                        <td className="px-4 py-3 text-foreground/80">{o.deadline}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditing({ ...o })}
                            className="text-primary hover:underline"
                          >
                            Edit
                          </button>
                          <span className="px-2 text-muted-foreground">·</span>
                          <Link
                            to="/opportunities/$id"
                            params={{ id: o.id }}
                            className="text-foreground/70 hover:text-primary"
                          >
                            View
                          </Link>
                          <span className="px-2 text-muted-foreground">·</span>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${o.name}"?`)) {
                                deleteOpportunity(o.id);
                                if (editing?.id === o.id) setEditing(null);
                              }
                            }}
                            className="text-destructive hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                          No opportunities.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              {editing ? (
                <EditorPanel
                  initial={editing}
                  categories={categories}
                  onCancel={() => setEditing(null)}
                  onSave={(o) => {
                    upsertOpportunity(o);
                    setEditing(null);
                  }}
                />
              ) : (
                <div className="border border-dashed border-border bg-card p-8 text-center text-[13.5px] text-muted-foreground">
                  Select an opportunity to edit, or create a new one.
                </div>
              )}
            </aside>
          </div>
        )}

        {tab === "cats" && (
          <div className="max-w-2xl">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categories (comma-separated)
            </label>
            <textarea
              value={catInput}
              onChange={(e) => setCatInput(e.target.value)}
              rows={6}
              className="mt-2 w-full border border-border bg-card p-3 text-[14px] outline-none focus:border-primary"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setCategories(catInput.split(","))}
                className="h-9 bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark"
              >
                Save categories
              </button>
              <button
                onClick={() => setCatInput(categories.join(", "))}
                className="h-9 border border-border bg-background px-3 text-[13px] hover:bg-muted"
              >
                Revert
              </button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li
                  key={c}
                  className="border border-border bg-card px-3 py-1 text-[12.5px] text-foreground/80"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function EditorPanel({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial: Opportunity;
  categories: string[];
  onSave: (o: Opportunity) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Opportunity>(initial);
  const isNew = !initial.id;

  const set = <K extends keyof Opportunity>(k: K, v: Opportunity[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    const id = form.id || slugify(form.name);
    if (!id || !form.name.trim()) {
      alert("Name is required.");
      return;
    }
    onSave({
      ...form,
      id,
      logo: form.logo || form.name.charAt(0).toUpperCase(),
    });
  };

  return (
    <div className="border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-[22px]">{isNew ? "New opportunity" : "Edit opportunity"}</h3>
        <button onClick={onCancel} className="text-[13px] text-muted-foreground hover:text-primary">
          Close
        </button>
      </div>
      <div className="space-y-3">
        <Field label="Name">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Organization">
          <input value={form.org} onChange={(e) => set("org", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Short tagline">
          <input
            value={form.short}
            onChange={(e) => set("short", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <input
              list="cat-list"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputCls}
            />
            <datalist id="cat-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Industry">
            <input
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Stage">
            <input
              value={form.stage}
              onChange={(e) => set("stage", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Location">
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Amount">
            <input
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Deadline">
            <input
              value={form.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              placeholder="Rolling or Mar 31, 2026"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Eligibility">
          <textarea
            value={form.eligibility}
            onChange={(e) => set("eligibility", e.target.value)}
            rows={3}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Logo letter">
            <input
              value={form.logo}
              onChange={(e) => set("logo", e.target.value.slice(0, 2))}
              className={inputCls}
            />
          </Field>
          <Field label="Slug (id)">
            <input
              value={form.id}
              onChange={(e) => set("id", slugify(e.target.value))}
              placeholder={slugify(form.name)}
              className={inputCls}
            />
          </Field>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="h-9 border border-border bg-background px-4 text-[13px] hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="h-9 bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark"
        >
          {isNew ? "Create" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "h-9 w-full border border-border bg-background px-3 text-[13.5px] outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {children}
    </label>
  );
}
