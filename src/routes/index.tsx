import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader } from "@/components/site-header";
import { getInvestorMeta } from "@/lib/api/investors.functions";
import { getJobFacets } from "@/lib/api/jobs.functions";
import { getPreferredSiteMode } from "@/lib/api/site-mode.functions";
import { listOpportunities } from "@/lib/api/opportunities.functions";
import { meityAccelerators, meityIncubators } from "@/lib/meity";
import { siteModeCookie } from "@/lib/site-mode";

export const Route = createFileRoute("/")({
  // The router parses ?choose=1 as a number, so accept both forms.
  validateSearch: z.object({ choose: z.union([z.string(), z.number()]).optional() }),
  beforeLoad: async ({ search }) => {
    if (String(search.choose) === "1") return;
    const mode = await getPreferredSiteMode();
    if (mode) throw redirect({ to: mode === "career" ? "/career" : "/business" });
  },
  head: () => ({
    meta: [
      { title: "StartItUp.in — Build a business or a career." },
      {
        name: "description",
        content:
          "Explore India's startup ecosystem or find live jobs directly from employers' own careers sites.",
      },
      { property: "og:title", content: "StartItUp.in — Build a business or a career." },
      {
        property: "og:description",
        content:
          "Explore India's startup ecosystem or find live jobs directly from employers' own careers sites.",
      },
      { property: "og:url", content: "https://startitup.in" },
    ],
    links: [{ rel: "canonical", href: "https://startitup.in" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://startitup.in/#website",
              url: "https://startitup.in",
              name: "StartItUp.in",
              description: "A home for India's founders and job seekers.",
            },
            {
              "@type": "Organization",
              "@id": "https://startitup.in/#organization",
              name: "StartItUp.in",
              url: "https://startitup.in",
              logo: "https://startitup.in/og-image.png",
              sameAs: [
                "https://x.com/ashik_j_o_y",
                "https://www.linkedin.com/in/ashikjoyofficial/",
                "https://github.com/ashikjoy21",
              ],
            },
          ],
        }),
      },
    ],
  }),
  loader: async () => {
    const [opportunities, jobs, investors] = await Promise.all([
      listOpportunities({ data: { limit: 1, offset: 0 } }),
      getJobFacets(),
      getInvestorMeta().catch(() => null),
    ]);
    return { opportunities: opportunities.total, jobs, investors: investors?.counts ?? null };
  },
  component: ChooseSide,
});

function ChooseSide() {
  const { opportunities, jobs, investors } = Route.useLoaderData();
  const incubators = meityIncubators.length;
  const accelerators = meityAccelerators.length;
  const businessMeta = `${incubators.toLocaleString("en-IN")} incubators · ${accelerators.toLocaleString("en-IN")} accelerators · ${(investors?.investors ?? opportunities).toLocaleString("en-IN")} ${investors?.investors ? "investors" : "opportunities"} · ${(investors?.funding_rounds ?? 0).toLocaleString("en-IN")} funding rounds`;
  const choose = (mode: "business" | "career") => {
    document.cookie = siteModeCookie(mode);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1280px] flex-col justify-center px-6 py-16">
        <div className="mb-12 text-center">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            StartItUp.in
          </p>
          <h1 className="mt-5 font-serif text-[48px] leading-[1.04] tracking-[-0.01em] md:text-[68px]">
            Build a business,
            <br className="sm:hidden" /> or <em className="italic text-primary">build a career.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            One place for India's founders and the people ready for their next role.
          </p>
        </div>
        <div className="grid gap-px border border-border bg-border md:grid-cols-2">
          <Link
            to="/business"
            onClick={() => choose("business")}
            className="group flex min-h-[260px] flex-col justify-between bg-card p-8 transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary md:min-h-[320px] md:p-12"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                For founders
              </p>
              <h2 className="mt-5 font-serif text-[36px] leading-tight md:text-[44px]">
                Build a business<span className="text-primary"> →</span>
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                Find funding, incubators, investors, grants and the people building India's next
                companies.
              </p>
            </div>
            <p className="mt-10 border-t border-border pt-4 text-[12.5px] text-muted-foreground">
              {businessMeta}
            </p>
          </Link>
          <Link
            to="/career"
            onClick={() => choose("career")}
            className="group flex min-h-[260px] flex-col justify-between bg-card p-8 transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary md:min-h-[320px] md:p-12"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                For your next move
              </p>
              <h2 className="mt-5 font-serif text-[36px] leading-tight md:text-[44px]">
                Build a career<span className="text-primary"> →</span>
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                Search open roles from employers' own career sites. Find the source, then apply
                direct.
              </p>
            </div>
            <p className="mt-10 border-t border-border pt-4 text-[12.5px] text-muted-foreground">
              {jobs.total.toLocaleString("en-IN")} live roles ·{" "}
              {jobs.companies.toLocaleString("en-IN")} employers
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
