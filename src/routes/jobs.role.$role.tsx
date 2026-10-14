import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { OrgLogo } from "@/components/opportunity-row";
import { VerifiedBadge } from "@/components/verified-badge";
import { getJobFacets, listJobs } from "@/lib/api/jobs.functions";
import { ROLE_FAMILIES, roleFromSlug, toSlug } from "@/lib/jobs-search";
import { telegramTopic } from "@/lib/telegram";

export const Route = createFileRoute("/jobs/role/$role")({
  loader: async ({ params }) => {
    const role = roleFromSlug(params.role);
    if (!role || role === "Other") throw notFound();
    const [list, facets] = await Promise.all([
      listJobs({ data: { role, page: 1 } }),
      getJobFacets(),
    ]);
    return { role, list, facets };
  },
  head: ({ params, loaderData }) => {
    const role = loaderData?.role ?? roleFromSlug(params.role) ?? "Jobs";
    const count = loaderData?.facets.roles.find((r) => r.name === role)?.n ?? 0;
    const employers =
      loaderData?.list.items
        .slice(0, 3)
        .map((j) => j.org)
        .filter((n, i, a) => a.indexOf(n) === i)
        .join(", ") || "leading employers";
    const title = `${role} jobs in India — ${count.toLocaleString("en-IN")} open roles | StartItUp.in`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Browse ${count.toLocaleString("en-IN")} ${role.toLowerCase()} jobs in India from ${employers}. Find roles refreshed from employers' careers sites.`,
        },
        { property: "og:title", content: title },
        { property: "og:image", content: "https://startitup.in/og-careers.png" },
        { name: "twitter:image", content: "https://startitup.in/og-careers.png" },
      ],
      links: [{ rel: "canonical", href: `https://startitup.in/jobs/role/${params.role}` }],
    };
  },
  component: RolePage,
});

function RolePage() {
  const { role, list, facets } = Route.useLoaderData();
  const cities = facets.cities.slice(0, 12);
  const count = facets.roles.find((r) => r.name === role)?.n ?? 0;
  const telegram = telegramTopic({ roleFamily: role, kind: null, experienceMin: null });
  return (
    <SiteLayout>
      <main className="mx-auto max-w-[1280px] px-6 py-14">
        <h1 className="font-serif text-[40px] leading-tight md:text-[52px]">
          <em className="italic text-primary">{role}</em> jobs in India
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          {count.toLocaleString("en-IN")} open roles across India, refreshed from employers' careers
          sites.
        </p>
        <a
          href={telegram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block border border-border bg-primary-soft px-3 py-2 text-[13px] text-primary hover:underline"
        >
          New {telegram.name} jobs on Telegram: join the group →
        </a>
        <ul className="mt-8 space-y-3">
          {list.items.map((job) => (
            <li key={job.id} className="flex items-start gap-4 border border-border bg-card p-4">
              <OrgLogo logo={job.logo} org={job.org} size={10} />
              <div className="min-w-0 flex-1">
                <Link
                  to="/jobs/$id"
                  params={{ id: job.id }}
                  className="text-[15px] font-medium hover:text-primary hover:underline"
                >
                  {job.title}
                </Link>
                <div className="mt-1 text-[13px] text-muted-foreground">
                  {job.org} · {job.locations.join(", ") || "India"}
                </div>
                <div className="mt-1">
                  <VerifiedBadge at={job.lastVerifiedAt} org={job.org} size="sm" />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link
          to="/jobs"
          search={{ role: role as (typeof ROLE_FAMILIES)[number] }}
          className="mt-6 inline-block text-[13.5px] text-primary hover:underline"
        >
          See all {count.toLocaleString("en-IN")} roles with filters →
        </Link>
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="font-serif text-[28px]">Top cities</h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {cities.map((city) => (
              <Link
                key={city.name}
                to="/jobs/city/$city"
                params={{ city: toSlug(city.name) }}
                className="text-[13.5px] text-primary hover:underline"
              >
                {city.name} ({city.n.toLocaleString("en-IN")})
              </Link>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
