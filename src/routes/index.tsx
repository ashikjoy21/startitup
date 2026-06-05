import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { categories, opportunities } from "@/lib/opportunities";

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
  component: Index,
});

function Index() {
  const featured = opportunities.slice(0, 5);
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1280px] gap-14 px-6 py-24 lg:grid-cols-[1.05fr_1fr] lg:py-32">
          <div>
            <h1 className="font-serif text-[60px] leading-[1.04] tracking-[-0.01em] text-foreground md:text-[78px]">
              Every startup opportunity
              <br />
              in India. <em className="italic text-primary">One place.</em>
            </h1>
            <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-foreground/75">
              Discover startup credits, grants, accelerators, incubators, fellowships, and funding
              opportunities tailored to your startup.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/opportunities"
                className="inline-flex h-11 items-center bg-primary px-5 text-[14px] font-medium text-primary-foreground hover:bg-primary-dark"
              >
                Explore Opportunities →
              </Link>
              <Link
                to="/profile"
                className="inline-flex h-11 items-center border border-border bg-background px-5 text-[14px] font-medium hover:bg-muted"
              >
                Create Founder Profile
              </Link>
            </div>
            <p className="mt-6 text-[13px] text-muted-foreground">
              Used by 12,400+ Indian founders · Updated weekly
            </p>
          </div>

          {/* Dashboard mock */}
          <div className="border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
              </div>
              <div className="text-[12px] text-muted-foreground">startitup.in/dashboard</div>
              <div className="w-10" />
            </div>
            <div className="px-5 pb-5 pt-5">
              <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
                Recommended for you
              </div>
              <h3 className="mt-1 font-serif text-[22px] leading-tight">
                12 new opportunities this week
              </h3>
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {featured.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-9 w-9 items-center justify-center border border-border bg-primary-soft font-serif text-base text-primary">
                      {o.logo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium">{o.name}</div>
                      <div className="truncate text-[12px] text-muted-foreground">
                        {o.category} · {o.amount} · {o.deadline}
                      </div>
                    </div>
                    <button className="text-[12px] text-primary hover:underline">View</button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-right">
                <Link to="/opportunities" className="text-[12.5px] text-primary hover:underline">
                  See all opportunities →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-8 gap-y-10 px-6 py-16 md:grid-cols-4">
          {[
            ["1,000+", "Opportunities"],
            ["₹500Cr+", "Funding Programs"],
            ["500+", "Credit Offers"],
            ["Weekly", "Updated"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-serif text-[44px] leading-none text-foreground">{n}</div>
              <div className="mt-3 text-[13px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-[40px] leading-tight md:text-[48px]">
              Browse by category
            </h2>
            <Link to="/opportunities" className="text-[13.5px] text-primary hover:underline">
              All opportunities →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c}
                to="/opportunities"
                className="group flex h-36 flex-col justify-between bg-card p-5 hover:bg-primary-soft"
              >
                <span className="font-serif text-[22px] leading-tight">{c}</span>
                <span className="text-[12.5px] text-muted-foreground group-hover:text-primary">
                  Browse →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial pull quote */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1100px] px-6 py-28 text-center">
          <p className="font-serif text-[36px] leading-[1.2] md:text-[52px]">
            “Most Indian founders miss out on{" "}
            <em className="italic text-primary">crores in credits and grants</em> simply because
            they don't know they exist.”
          </p>
          <p className="mt-8 text-[13.5px] text-muted-foreground">— StartItUp.in editorial</p>
        </div>
      </section>

      {/* Featured opportunities */}
      <section>
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <h2 className="font-serif text-[40px] leading-tight md:text-[48px]">
            Recently added
          </h2>
          <div className="mt-8 space-y-3">
            {opportunities.slice(0, 4).map((o) => (
              <div key={o.id} className="flex items-center gap-4 border border-border bg-card p-5">
                <div className="flex h-12 w-12 items-center justify-center border border-border bg-primary-soft font-serif text-xl text-primary">
                  {o.logo}
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px]">
                    <span className="font-semibold">{o.org}</span>
                    <span className="text-muted-foreground"> · {o.short}</span>
                  </div>
                  <Link
                    to="/opportunities/$id"
                    params={{ id: o.id }}
                    className="text-[15px] font-medium text-primary hover:underline"
                  >
                    {o.name}
                  </Link>
                  <div className="mt-1 text-[12.5px] text-muted-foreground">
                    {o.category} · {o.amount} · Deadline: {o.deadline}
                  </div>
                </div>
                <Link
                  to="/opportunities/$id"
                  params={{ id: o.id }}
                  className="inline-flex h-9 items-center bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary-dark"
                >
                  Apply
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
