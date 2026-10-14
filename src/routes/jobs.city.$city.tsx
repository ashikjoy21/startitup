import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { OrgLogo } from "@/components/opportunity-row";
import { VerifiedBadge } from "@/components/verified-badge";
import { getJobFacets, listJobs } from "@/lib/api/jobs.functions";
import { ROLE_FAMILIES, toSlug } from "@/lib/jobs-search";
import { TELEGRAM_GROUP_URL } from "@/lib/telegram";

export const Route = createFileRoute("/jobs/city/$city")({
  loader: async ({ params }) => {
    const facets = await getJobFacets();
    const city = facets.cities.find((item) => toSlug(item.name) === params.city);
    if (!city) throw notFound();
    const [list, roles] = await Promise.all([
      listJobs({ data: { city: city.name, page: 1 } }),
      Promise.resolve(facets.roles),
    ]);
    return { city, list, roles };
  },
  head: ({ params, loaderData }) => {
    const city = loaderData?.city.name ?? params.city;
    const count = loaderData?.city.n ?? 0;
    const employers =
      loaderData?.list.items
        .slice(0, 3)
        .map((item) => item.org)
        .filter((name, index, all) => all.indexOf(name) === index)
        .join(", ") || "leading employers";
    const title = `Jobs in ${city} — ${count.toLocaleString("en-IN")} open roles | StartItUp.in`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Browse ${count.toLocaleString("en-IN")} open jobs in ${city} from ${employers}. Find roles refreshed from employers' careers sites.`,
        },
        { property: "og:title", content: title },
        { property: "og:image", content: "https://startitup.in/og-careers.png" },
        { name: "twitter:image", content: "https://startitup.in/og-careers.png" },
      ],
      links: [{ rel: "canonical", href: `https://startitup.in/jobs/city/${params.city}` }],
    };
  },
  component: CityPage,
});

function CityPage() {
  const { city, list, roles } = Route.useLoaderData();
  const topRoles = roles.filter((r) => r.name !== "Other" && r.n > 0).slice(0, 8);
  return (
    <SiteLayout>
      <main className="mx-auto max-w-[1280px] px-6 py-14">
        <h1 className="font-serif text-[40px] leading-tight md:text-[52px]">
          Jobs in <em className="italic text-primary">{city.name}</em>
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          {city.n.toLocaleString("en-IN")} open roles in {city.name}, refreshed from employers'
          careers sites.
        </p>
        <a
          href={TELEGRAM_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block border border-border bg-primary-soft px-3 py-2 text-[13px] text-primary hover:underline"
        >
          New jobs every 30 minutes on Telegram: join t.me/startitupjobs →
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
                  {job.org} · {job.locations.join(", ")}
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
          search={{ city: city.name }}
          className="mt-6 inline-block text-[13.5px] text-primary hover:underline"
        >
          See all {city.n.toLocaleString("en-IN")} roles with filters →
        </Link>
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="font-serif text-[28px]">Top roles in {city.name}</h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {topRoles.map((role) => (
              <Link
                key={role.name}
                to="/jobs/role/$role"
                params={{ role: toSlug(role.name) }}
                className="text-[13.5px] text-primary hover:underline"
              >
                {role.name} ({role.n.toLocaleString("en-IN")})
              </Link>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
