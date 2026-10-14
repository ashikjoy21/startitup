import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { OrgLogo } from "@/components/opportunity-row";
import { getJobFacets, listJobs, type JobListing } from "@/lib/api/jobs.functions";
import { JOBS_PAGE_SIZE, postedLabel } from "@/lib/jobs-search";

const KINDS = [
  { id: undefined, label: "All types" },
  { id: "job", label: "Jobs" },
  { id: "internship", label: "Internships" },
  { id: "graduate_program", label: "Graduate programmes" },
  { id: "apprenticeship", label: "Apprenticeships" },
] as const;
const MODES = [
  { id: undefined, label: "Any work mode" },
  { id: "onsite", label: "On-site" },
  { id: "hybrid", label: "Hybrid" },
  { id: "remote", label: "Remote" },
] as const;

const searchSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  company: z.string().optional(),
  kind: z.enum(["job", "internship", "graduate_program", "apprenticeship", "govt_job"]).optional(),
  mode: z.enum(["onsite", "hybrid", "remote"]).optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs in India — StartItUp.in" },
      { name: "description", content: "Every open role at hundreds of Indian and global employers, read straight from their own careers sites and refreshed every few hours." },
      { property: "og:title", content: "Jobs in India — StartItUp.in" },
      { property: "og:url", content: "https://startitup.in/jobs" },
    ],
    links: [{ rel: "canonical", href: "https://startitup.in/jobs" }],
  }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [list, facets] = await Promise.all([listJobs({ data: { ...deps, page: deps.page ?? 1 } }), getJobFacets()]);
    return { ...list, facets };
  },
  component: JobsPage,
});

function JobsPage() {
  const { items, total, facets } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs" });
  const [q, setQ] = useState(search.q ?? "");
  const page = search.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / JOBS_PAGE_SIZE));
  const set = (patch: Partial<z.infer<typeof searchSchema>>) =>
    navigate({ search: (p) => ({ ...p, ...patch, page: patch.page }) });

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-16 text-center">
          <h1 className="font-serif text-[46px] leading-[1.08] md:text-[60px]">
            Every open job in India,
            <br />
            <em className="italic text-primary">straight from the source</em>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[14.5px] text-foreground/80">
            {facets.total.toLocaleString("en-IN")} live roles from {facets.companies.toLocaleString("en-IN")} employers, read directly from
            their own careers sites and refreshed every few hours. Closed roles drop off automatically.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-8">
            <Choice label="Type" options={KINDS.map((k) => ({ id: k.id, label: k.label }))} value={search.kind} onPick={(kind) => set({ kind: kind as typeof search.kind })} />
            <Choice label="Work mode" options={MODES.map((m) => ({ id: m.id, label: m.label }))} value={search.mode} onPick={(mode) => set({ mode: mode as typeof search.mode })} />
            <Choice
              label="City"
              options={[{ id: undefined, label: "All cities" }, ...facets.cities.slice(0, 20).map((c) => ({ id: c.name, label: c.name, count: c.n }))]}
              value={search.city}
              onPick={(city) => set({ city })}
            />
            <Choice
              label="Top employers"
              options={[{ id: undefined, label: "All employers" }, ...facets.orgs.slice(0, 25).map((o) => ({ id: o.name, label: o.name, count: o.n }))]}
              value={search.company}
              onPick={(company) => set({ company })}
            />
          </aside>

          <div>
            <form
              className="flex items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                set({ q: q.trim() || undefined });
              }}
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search job titles or companies…"
                aria-label="Search jobs"
                className="h-11 w-full border border-border bg-card px-4 text-[14px] outline-none focus:border-primary"
              />
              <button type="submit" className="h-11 border border-primary bg-primary px-5 text-[13.5px] font-medium text-primary-foreground hover:opacity-90">
                Search
              </button>
            </form>
            <div className="mt-3 text-[13px] text-muted-foreground">
              {total.toLocaleString("en-IN")} {total === 1 ? "role" : "roles"}
              {search.city ? ` in ${search.city}` : ""}
              {search.company ? ` at ${search.company}` : ""}
            </div>

            <ul className="mt-6 space-y-3">
              {items.map((j) => (
                <JobRow key={j.id} j={j} />
              ))}
            </ul>
            {items.length === 0 && (
              <div className="border border-border bg-card p-10 text-center text-[14px] text-muted-foreground">No roles match these filters.</div>
            )}

            {pages > 1 && (
              <nav className="mt-8 flex items-center justify-between text-[13.5px]" aria-label="Pages">
                <button disabled={page <= 1} onClick={() => set({ page: page - 1 })} className="border border-border px-4 py-2 disabled:opacity-40">
                  ← Previous
                </button>
                <span className="text-muted-foreground">
                  Page {page} of {Math.min(pages, 200)}
                </span>
                <button disabled={page >= Math.min(pages, 200)} onClick={() => set({ page: page + 1 })} className="border border-border px-4 py-2 disabled:opacity-40">
                  Next →
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function JobRow({ j }: { j: JobListing }) {
  const where = [j.locations.slice(0, 3).join(", "), j.workMode === "remote" ? "Remote" : j.workMode === "hybrid" ? "Hybrid" : ""]
    .filter(Boolean)
    .join(" · ");
  const exp = j.experienceMin !== null ? `${j.experienceMin}${j.experienceMax !== null ? `–${j.experienceMax}` : "+"} yrs` : "";
  return (
    <li className="flex items-start gap-4 border border-border bg-card p-4">
      <OrgLogo logo={j.logo} org={j.org} size={10} />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium leading-snug">{j.title}</div>
        <div className="mt-1 text-[13px] text-muted-foreground">
          {[j.org, where || "India", exp, postedLabel(j.postedAt)].filter(Boolean).join(" · ")}
        </div>
      </div>
      {j.applyUrl && (
        <a
          href={j.applyUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="shrink-0 border border-border px-3 py-1.5 text-[13px] hover:border-primary hover:text-primary"
        >
          Apply ↗
        </a>
      )}
    </li>
  );
}

function Choice({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: Array<{ id: string | undefined; label: string; count?: number }>;
  value: string | undefined;
  onPick: (v: string | undefined) => void;
}) {
  return (
    <div>
      <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <ul className="space-y-1.5">
        {options.map((o) => (
          <li key={o.label}>
            <button
              onClick={() => onPick(o.id)}
              className={
                "flex w-full items-center justify-between gap-3 text-left text-[13.5px] " +
                (value === o.id ? "text-primary underline underline-offset-2" : "text-foreground/80 hover:text-primary")
              }
            >
              <span className="truncate">{o.label}</span>
              {o.count !== undefined && <span className="text-[11.5px] tabular-nums text-muted-foreground">{o.count.toLocaleString("en-IN")}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
