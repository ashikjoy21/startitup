import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { listOpportunities } from "@/lib/api/opportunities.functions";
import { getInvestorMeta } from "@/lib/api/investors.functions";
import { meityIncubators, meityAccelerators } from "@/lib/meity";
import { defaultCategories } from "@/lib/opportunities";

const INCUBATOR_COUNT = meityIncubators.length;
const ACCELERATOR_COUNT = meityAccelerators.length;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StartItUp.in — Every startup opportunity in India." },
      {
        name: "description",
        content:
          "Discover startup credits, grants, accelerators, incubators, fellowships, and funding opportunities for Indian founders.",
      },
      { property: "og:title", content: "StartItUp.in — Every startup opportunity in India." },
      {
        property: "og:description",
        content:
          "Discover startup credits, grants, accelerators, incubators, fellowships, and funding opportunities for Indian founders.",
      },
    ],
  }),
  loader: async () => {
    const list = await listOpportunities({ data: { limit: 1, offset: 0 } });
    let investorCounts = { investors: 0, funding_rounds: 0 };
    try {
      const meta = await getInvestorMeta();
      investorCounts = meta.counts;
    } catch {
      /* investor bundle not built yet */
    }
    return { total: list.total, source: list.source, investorCounts };
  },
  component: Index,
});

function Index() {
  const { total, source, investorCounts } = Route.useLoaderData();

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-serif text-[48px] leading-[1.06] tracking-[-0.01em] text-foreground md:text-[62px] lg:text-[76px]">
          Building a startup is hard.
          <br />
          <em className="italic text-primary">Finding opportunities</em>
          <br />
          <em className="italic text-primary">shouldn't be.<sup className="font-serif text-[22px] not-italic text-foreground/40 md:text-[28px]">[1]</sup></em>
        </h1>

        <div className="mt-14 max-w-md">
          <p className="font-serif text-[18px] italic leading-relaxed text-foreground/60">
            [1] "Opportunities don't happen. You create them."
          </p>
          <p className="mt-3 text-right font-serif text-[16px] italic text-foreground/45">
            — Chris Grosser
          </p>
        </div>

        {source === "seed" && (
          <p className="mt-6 text-[12px] text-amber-700">
            Demo data — connect Supabase in .env to load the live database.
          </p>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/30">
          <svg className="h-5 w-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Stats row */}
      <section className="border-b border-t border-border">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            [INCUBATOR_COUNT.toString(), "Incubators"],
            [ACCELERATOR_COUNT.toString(), "Accelerators"],
            [
              investorCounts.investors > 0
                ? `${investorCounts.investors.toLocaleString()}+`
                : `${total}+`,
              investorCounts.investors > 0 ? "Investors" : "Opportunities",
            ],
            [
              investorCounts.funding_rounds > 0
                ? `${investorCounts.funding_rounds.toLocaleString()}+`
                : "Weekly",
              investorCounts.funding_rounds > 0 ? "Funding rounds" : "Updated",
            ],
          ].map(([n, l]) => (
            <div key={l} className="px-8 py-10">
              <div className="font-serif text-[44px] leading-none text-foreground">{n}</div>
              <div className="mt-3 text-[13px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What is StartItUp? */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-[1fr_1px_1fr] md:gap-0">
            {/* Left: description */}
            <div className="md:pr-16">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                About
              </p>
              <h2 className="mt-4 font-serif text-[36px] leading-[1.1] md:text-[44px]">
                What is StartItUp?
              </h2>
              <p className="mt-6 text-[15.5px] leading-[1.75] text-muted-foreground">
                StartItUp is a startup intelligence platform that helps founders, investors,
                students, incubators, and researchers discover structured information about
                startups, funding rounds, investors, accelerators, grants, and ecosystem
                opportunities.
              </p>
            </div>

            {/* Divider */}
            <div className="hidden border-r border-border md:block" />

            {/* Right: capabilities */}
            <div className="md:pl-16">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                What can you do?
              </p>
              <ul className="mt-6">
                {[
                  "Discover startups",
                  "Explore investors",
                  "Track funding rounds",
                  "Find incubators & accelerators",
                  "Access startup ecosystem resources",
                  "Connect through APIs and MCP integrations",
                ].map((item, i) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-4 border-b border-border py-3.5 last:border-0"
                  >
                    <span className="font-serif text-[13px] text-muted-foreground/50 tabular-nums">
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

      {/* Browse by category */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-[40px] leading-tight md:text-[48px]">Browse by category</h2>
            <Link to="/opportunities" className="text-[13.5px] text-primary hover:underline">
              All opportunities →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {defaultCategories.map((c) => (
              <Link
                key={c}
                to="/opportunities"
                search={{ cat: c }}
                className="group flex h-36 flex-col justify-between bg-card p-5 hover:bg-primary-soft"
              >
                <span className="font-serif text-[22px] leading-tight">{c}</span>
                <span className="text-[12.5px] text-muted-foreground group-hover:text-primary">
                  Browse →
                </span>
              </Link>
            ))}
          </div>
          {(investorCounts.investors > 0 || investorCounts.funding_rounds > 0) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {investorCounts.investors > 0 && (
                <Link
                  to="/investors"
                  className="border border-border bg-card px-6 py-4 text-[14px] hover:border-primary/40"
                >
                  Browse {investorCounts.investors.toLocaleString()} investors →
                </Link>
              )}
              {investorCounts.funding_rounds > 0 && (
                <Link
                  to="/funding"
                  className="border border-border bg-card px-6 py-4 text-[14px] hover:border-primary/40"
                >
                  {investorCounts.funding_rounds.toLocaleString()} funding rounds →
                </Link>
              )}
              {(investorCounts.funded_startups ?? 0) > 0 && (
                <Link
                  to="/startups"
                  className="border border-border bg-card px-6 py-4 text-[14px] hover:border-primary/40"
                >
                  {(investorCounts.funded_startups ?? 0).toLocaleString()} funded startups →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
