import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site-layout";
import { OrgLogo } from "@/components/opportunity-row";
import { getJobFacets, listJobs, type JobListing } from "@/lib/api/jobs.functions";
import {
  EXPERIENCE_BANDS,
  JOBS_PAGE_SIZE,
  POSTED_WITHIN,
  ROLE_FAMILIES,
  postedLabel,
  toSlug,
} from "@/lib/jobs-search";

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
  role: z.enum(ROLE_FAMILIES).optional(),
  exp: z.enum(Object.keys(EXPERIENCE_BANDS) as [keyof typeof EXPERIENCE_BANDS]).optional(),
  posted: z.enum(Object.keys(POSTED_WITHIN) as [keyof typeof POSTED_WITHIN]).optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Jobs in India — StartItUp.in" },
      {
        name: "description",
        content:
          "Every open role at hundreds of Indian and global employers, read straight from their own careers sites and refreshed every few hours.",
      },
      { property: "og:title", content: "Jobs in India — StartItUp.in" },
      { property: "og:image", content: "https://startitup.in/og-careers.png" },
      { name: "twitter:image", content: "https://startitup.in/og-careers.png" },
      { property: "og:url", content: "https://startitup.in/jobs" },
    ],
    links: [{ rel: "canonical", href: "https://startitup.in/jobs" }],
  }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [list, facets] = await Promise.all([
      listJobs({ data: { ...deps, page: deps.page ?? 1 } }),
      getJobFacets(),
    ]);
    return { ...list, facets };
  },
  component: JobsPage,
});

function JobsPage() {
  const { items, total, facets } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs/" });
  const [q, setQ] = useState(search.q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllEmployers, setShowAllEmployers] = useState(false);
  const [employerQuery, setEmployerQuery] = useState("");
  const page = search.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / JOBS_PAGE_SIZE));
  const set = (patch: Partial<z.infer<typeof searchSchema>>) =>
    navigate({ search: (p) => ({ ...p, ...patch, page: patch.page ?? 1 }) });
  const selectedCount = [
    search.q,
    search.city,
    search.company,
    search.kind,
    search.mode,
    search.role,
    search.exp,
    search.posted,
  ].filter(Boolean).length;
  const employerFacets = useMemo(
    () =>
      facets.orgs.filter((o) => o.name.toLowerCase().includes(employerQuery.trim().toLowerCase())),
    [facets.orgs, employerQuery],
  );
  const roleOptions = ROLE_FAMILIES.filter((role) =>
    facets.roles.some((r) => r.name === role && r.n > 0),
  );
  const chips: Array<{ label: string; clear: () => void }> = [];
  if (search.q)
    chips.push({
      label: `Search: ${search.q}`,
      clear: () => {
        setQ("");
        set({ q: undefined });
      },
    });
  if (search.role)
    chips.push({ label: `Role: ${search.role}`, clear: () => set({ role: undefined }) });
  if (search.exp)
    chips.push({
      label: `Experience: ${EXPERIENCE_BANDS[search.exp].label}`,
      clear: () => set({ exp: undefined }),
    });
  if (search.posted)
    chips.push({
      label: POSTED_WITHIN[search.posted].label,
      clear: () => set({ posted: undefined }),
    });
  if (search.city) chips.push({ label: search.city, clear: () => set({ city: undefined }) });
  if (search.company)
    chips.push({ label: search.company, clear: () => set({ company: undefined }) });
  if (search.kind)
    chips.push({
      label: KINDS.find((k) => k.id === search.kind)?.label ?? search.kind,
      clear: () => set({ kind: undefined }),
    });
  if (search.mode)
    chips.push({
      label: MODES.find((m) => m.id === search.mode)?.label ?? search.mode,
      clear: () => set({ mode: undefined }),
    });
  const clearAll = () => {
    setQ("");
    set({
      q: undefined,
      city: undefined,
      company: undefined,
      kind: undefined,
      mode: undefined,
      role: undefined,
      exp: undefined,
      posted: undefined,
    });
  };
  const cityOptions = facets.cities.slice(0, showAllCities ? 40 : 8);
  const employerOptions = employerFacets.slice(0, showAllEmployers ? 80 : 8);

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
            {facets.total.toLocaleString("en-IN")} live roles from{" "}
            {facets.companies.toLocaleString("en-IN")} employers, read directly from their own
            careers sites and refreshed every few hours. Closed roles drop off automatically.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="mb-5 lg:hidden">
          <button
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full border border-border bg-card px-4 py-3 text-left text-[13.5px]"
          >
            Filters ({selectedCount} active) {filtersOpen ? "−" : "+"}
          </button>
        </div>
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside
            className={`${filtersOpen ? "block" : "hidden"} space-y-8 border border-border bg-card p-5 lg:block lg:border-0 lg:bg-transparent lg:p-0`}
          >
            <div>
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Job role
              </div>
              <ul className="space-y-1.5">
                {roleOptions.map((role) => {
                  const count = facets.roles.find((r) => r.name === role)?.n ?? 0;
                  return (
                    <li key={role}>
                      <button
                        type="button"
                        aria-pressed={search.role === role}
                        onClick={() => set({ role: search.role === role ? undefined : role })}
                        className={`flex w-full items-center justify-between gap-3 text-left text-[13.5px] ${search.role === role ? "text-primary underline underline-offset-2" : "text-foreground/80 hover:text-primary"}`}
                      >
                        <span className="truncate">{role}</span>
                        <span className="text-[11.5px] tabular-nums text-muted-foreground">
                          {count.toLocaleString("en-IN")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <Choice
              label="Experience"
              note="Many employers don't state it"
              options={[
                { id: undefined, label: "Any experience" },
                ...Object.entries(EXPERIENCE_BANDS).map(([id, band]) => ({
                  id,
                  label: band.label,
                })),
              ]}
              value={search.exp}
              onPick={(exp) => set({ exp: exp as typeof search.exp })}
            />
            <Choice
              label="Date posted"
              options={[
                { id: undefined, label: "Any time" },
                ...Object.entries(POSTED_WITHIN).map(([id, value]) => ({ id, label: value.label })),
              ]}
              value={search.posted}
              onPick={(posted) => set({ posted: posted as typeof search.posted })}
            />
            <Choice
              label="Type"
              options={KINDS.map((k) => ({ id: k.id, label: k.label }))}
              value={search.kind}
              onPick={(kind) => set({ kind: kind as typeof search.kind })}
            />
            <Choice
              label="Work mode"
              options={MODES.map((m) => ({ id: m.id, label: m.label }))}
              value={search.mode}
              onPick={(mode) => set({ mode: mode as typeof search.mode })}
            />
            <Choice
              label="City"
              options={[
                { id: undefined, label: "All cities" },
                ...cityOptions.map((c) => ({ id: c.name, label: c.name, count: c.n })),
              ]}
              value={search.city}
              onPick={(city) => set({ city })}
            />
            <ToggleMore
              expanded={showAllCities}
              onToggle={() => setShowAllCities(!showAllCities)}
              total={facets.cities.length}
            />
            <div>
              <label
                htmlFor="employer-filter"
                className="mb-3 block text-[12px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Employers
              </label>
              <input
                id="employer-filter"
                aria-label="Filter employers by name"
                value={employerQuery}
                onChange={(e) => setEmployerQuery(e.target.value)}
                placeholder="Filter employers…"
                className="mb-3 h-9 w-full border border-border bg-card px-3 text-[13px] outline-none focus:border-primary"
              />
              <Choice
                label=""
                options={[
                  { id: undefined, label: "All employers" },
                  ...employerOptions.map((o) => ({ id: o.name, label: o.name, count: o.n })),
                ]}
                value={search.company}
                onPick={(company) => set({ company })}
              />
              {employerFacets.length > 8 && (
                <ToggleMore
                  expanded={showAllEmployers}
                  onToggle={() => setShowAllEmployers(!showAllEmployers)}
                  total={facets.orgs.length}
                />
              )}
            </div>
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
              <button
                type="submit"
                className="h-11 border border-primary bg-primary px-5 text-[13.5px] font-medium text-primary-foreground hover:opacity-90"
              >
                Search
              </button>
            </form>
            <div className="mt-3 text-[13px] text-muted-foreground">
              {total.toLocaleString("en-IN")} {total === 1 ? "role" : "roles"}
              {search.city ? ` in ${search.city}` : ""}
              {search.company ? ` at ${search.company}` : ""}
              {search.role ? ` · ${search.role}` : ""}
            </div>
            {chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={chip.clear}
                    className="border border-border bg-card px-2.5 py-1 text-[12px] text-foreground/80 hover:border-primary hover:text-primary"
                  >
                    {chip.label} ×
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2 py-1 text-[12px] text-primary underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}

            <ul className="mt-6 space-y-3">
              {items.map((j) => (
                <JobRow key={j.id} j={j} />
              ))}
            </ul>
            {items.length === 0 && (
              <div className="border border-border bg-card p-10 text-center text-[14px] text-muted-foreground">
                No roles match these filters.
              </div>
            )}

            {pages > 1 && (
              <nav
                className="mt-8 flex items-center justify-between text-[13.5px]"
                aria-label="Pages"
              >
                <button
                  disabled={page <= 1}
                  onClick={() => set({ page: page - 1 })}
                  className="border border-border px-4 py-2 disabled:opacity-40"
                >
                  ← Previous
                </button>
                <span className="text-muted-foreground">
                  Page {page} of {Math.min(pages, 200)}
                </span>
                <button
                  disabled={page >= Math.min(pages, 200)}
                  onClick={() => set({ page: page + 1 })}
                  className="border border-border px-4 py-2 disabled:opacity-40"
                >
                  Next →
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-10 text-[12.5px] leading-7">
          <p className="font-medium">Browse jobs by city</p>
          <div className="flex flex-wrap gap-x-4">
            {facets.cities.slice(0, 20).map((city) => (
              <Link
                key={city.name}
                to="/jobs/city/$city"
                params={{ city: toSlug(city.name) }}
                className="text-muted-foreground hover:text-primary"
              >
                {city.name}
              </Link>
            ))}
          </div>
          <p className="mt-4 font-medium">Browse jobs by role</p>
          <div className="flex flex-wrap gap-x-4">
            {facets.roles
              .filter((role) => role.name !== "Other" && role.n > 0)
              .map((role) => (
                <Link
                  key={role.name}
                  to="/jobs/role/$role"
                  params={{ role: toSlug(role.name) }}
                  className="text-muted-foreground hover:text-primary"
                >
                  {role.name}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function JobRow({ j }: { j: JobListing }) {
  const where = [
    j.locations.slice(0, 3).join(", "),
    j.workMode === "remote" ? "Remote" : j.workMode === "hybrid" ? "Hybrid" : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const exp =
    j.experienceMin !== null
      ? `${j.experienceMin}${j.experienceMax !== null ? `–${j.experienceMax}` : "+"} yrs`
      : "";
  return (
    <li className="flex items-start gap-4 border border-border bg-card p-4">
      <OrgLogo logo={j.logo} org={j.org} size={10} />
      <div className="min-w-0 flex-1">
        <Link
          to="/jobs/$id"
          params={{ id: j.id }}
          className="text-[15px] font-medium leading-snug hover:text-primary hover:underline"
        >
          {j.title}
        </Link>
        <div className="mt-1 text-[13px] text-muted-foreground">
          {[j.org, where || "India", exp, postedLabel(j.postedAt)].filter(Boolean).join(" · ")}
        </div>
        {j.roleFamily && j.roleFamily !== "Other" && (
          <div className="mt-1 text-[11.5px] text-muted-foreground">{j.roleFamily}</div>
        )}
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
  note,
}: {
  label: string;
  options: Array<{ id: string | undefined; label: string; count?: number }>;
  value: string | undefined;
  onPick: (v: string | undefined) => void;
  note?: string;
}) {
  return (
    <div>
      {label && (
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      {note && <div className="-mt-2 mb-3 text-[11.5px] text-muted-foreground">{note}</div>}
      <ul className="space-y-1.5">
        {options.map((o) => (
          <li key={o.label}>
            <button
              type="button"
              aria-pressed={value === o.id}
              onClick={() => onPick(o.id)}
              className={
                "flex w-full items-center justify-between gap-3 text-left text-[13.5px] " +
                (value === o.id
                  ? "text-primary underline underline-offset-2"
                  : "text-foreground/80 hover:text-primary")
              }
            >
              <span className="truncate">{o.label}</span>
              {o.count !== undefined && (
                <span className="text-[11.5px] tabular-nums text-muted-foreground">
                  {o.count.toLocaleString("en-IN")}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToggleMore({
  expanded,
  onToggle,
  total,
}: {
  expanded: boolean;
  onToggle: () => void;
  total: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-2 text-[12px] text-primary hover:underline"
    >
      {expanded ? "Show fewer" : `Show all (${total})`}
    </button>
  );
}
