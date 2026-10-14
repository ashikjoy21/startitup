import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { getJobFacets } from "@/lib/api/jobs.functions";
import { ROLE_FAMILIES } from "@/lib/jobs-search";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Careers in India — StartItUp.in" },
      {
        name: "description",
        content:
          "Find live jobs, internships, graduate programmes and apprenticeships, read directly from employers' own careers sites.",
      },
      { property: "og:title", content: "Careers in India — StartItUp.in" },
      { property: "og:description", content: "Every open role, straight from the source." },
    ],
    links: [{ rel: "canonical", href: "https://startitup.in/career" }],
  }),
  loader: () => getJobFacets(),
  component: CareerHome,
});

const kinds = [
  ["Jobs", "job"],
  ["Internships", "internship"],
  ["Graduate programmes", "graduate_program"],
  ["Apprenticeships", "apprenticeship"],
] as const;

function CareerHome() {
  const facets = Route.useLoaderData();
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-24 text-center md:py-32">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            StartItUp careers
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl font-serif text-[46px] leading-[1.06] tracking-[-0.01em] md:text-[64px] lg:text-[72px]">
            Every open job in India,
            <br />
            <em className="italic text-primary">straight from the source.</em>
          </h1>
          <form action="/jobs" method="get" className="mx-auto mt-10 flex max-w-2xl gap-2">
            <input
              name="q"
              aria-label="Search jobs and employers"
              placeholder="Job title, skill or employer…"
              className="h-12 min-w-0 flex-1 border border-border bg-card px-4 text-[14px] outline-none focus:border-primary"
            />
            <button className="h-12 border border-primary bg-primary px-6 text-[13.5px] font-medium text-primary-foreground hover:opacity-90">
              Search roles
            </button>
          </form>
          <Link to="/jobs" className="mt-5 inline-block text-[13px] text-primary hover:underline">
            Explore all {facets.total.toLocaleString("en-IN")} roles →
          </Link>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            [facets.total.toLocaleString("en-IN"), "Live roles"],
            [facets.companies.toLocaleString("en-IN"), "Employers"],
            [facets.cities.length.toLocaleString("en-IN"), "Cities"],
            ["Every 2 hours", "Refreshed"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="border-b border-border px-6 py-8 md:border-0 md:px-8 md:py-10"
            >
              <div className="font-serif text-[38px] leading-none text-foreground md:text-[44px]">
                {value}
              </div>
              <div className="mt-3 text-[13px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <h2 className="font-serif text-[40px] leading-tight md:text-[48px]">Browse by role</h2>
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {facets.roles
              .filter((role) => role.name !== "Other" && role.n > 0)
              .map((role) => (
                <Link
                  key={role.name}
                  to="/jobs"
                  search={{ role: role.name as (typeof ROLE_FAMILIES)[number] }}
                  className="group flex min-h-32 flex-col justify-between bg-card p-5 hover:bg-primary-soft"
                >
                  <span className="font-serif text-[22px] leading-tight">{role.name}</span>
                  <span className="text-[12.5px] text-muted-foreground group-hover:text-primary">
                    {role.n.toLocaleString("en-IN")} roles →
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-[40px] leading-tight md:text-[48px]">Browse by city</h2>
            <Link to="/jobs" className="text-[13.5px] text-primary hover:underline">
              All roles →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {facets.cities.slice(0, 12).map((city) => (
              <Link
                key={city.name}
                to="/jobs"
                search={{ city: city.name }}
                className="group flex h-32 flex-col justify-between bg-card p-5 hover:bg-primary-soft"
              >
                <span className="font-serif text-[22px] leading-tight">{city.name}</span>
                <span className="text-[12.5px] text-muted-foreground group-hover:text-primary">
                  {city.n.toLocaleString("en-IN")} roles →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-[40px] leading-tight md:text-[48px]">Top employers</h2>
            <Link to="/jobs" className="text-[13.5px] text-primary hover:underline">
              All employers →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3 lg:grid-cols-4">
            {facets.orgs.slice(0, 12).map((org) => (
              <Link
                key={org.name}
                to="/jobs"
                search={{ company: org.name }}
                className="group flex min-h-28 flex-col justify-between bg-card p-5 hover:bg-primary-soft"
              >
                <span className="font-serif text-[20px] leading-tight">{org.name}</span>
                <span className="text-[12.5px] text-muted-foreground group-hover:text-primary">
                  {org.n.toLocaleString("en-IN")} roles →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <h2 className="font-serif text-[40px] leading-tight md:text-[48px]">Browse by type</h2>
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {kinds.map(([label, kind]) => (
              <Link
                key={kind}
                to="/jobs"
                search={{ kind }}
                className="group flex h-36 flex-col justify-between bg-card p-5 hover:bg-primary-soft"
              >
                <span className="font-serif text-[22px] leading-tight">{label}</span>
                <span className="text-[12.5px] text-muted-foreground group-hover:text-primary">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-[1fr_1px_1fr] md:gap-0">
            <div className="md:pr-16">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                How it works
              </p>
              <h2 className="mt-4 font-serif text-[36px] leading-[1.1] md:text-[44px]">
                A clearer way to find your next role.
              </h2>
              <p className="mt-6 text-[15.5px] leading-[1.75] text-muted-foreground">
                We read open positions directly from employers' own career sites and refresh the
                listings every few hours. When a role closes, it drops off. When you're ready, you
                apply on the employer's site.
              </p>
            </div>
            <div className="hidden border-r border-border md:block" />
            <div className="md:pl-16">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Why StartItUp?
              </p>
              <ul className="mt-6">
                {[
                  "Roles come from employers' own career sites",
                  "Listings refresh every few hours",
                  "Closed roles drop off automatically",
                  "Apply directly on the employer's site",
                  "No recruiters or job aggregators",
                ].map((item, i) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-4 border-b border-border py-3.5 last:border-0"
                  >
                    <span className="font-serif text-[13px] tabular-nums text-muted-foreground/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
