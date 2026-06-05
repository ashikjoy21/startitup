import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { getOpportunity, opportunities } from "@/lib/opportunities";

export const Route = createFileRoute("/opportunities/$id")({
  head: ({ params }) => {
    const o = getOpportunity(params.id);
    return {
      meta: [
        { title: o ? `${o.name} — StartItUp.in` : "Opportunity — StartItUp.in" },
        { name: "description", content: o?.short ?? "Startup opportunity details." },
      ],
    };
  },
  loader: ({ params }) => {
    const o = getOpportunity(params.id);
    if (!o) throw notFound();
    return o;
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-serif text-5xl">Opportunity not found</h1>
        <Link to="/opportunities" className="mt-6 inline-block text-primary hover:underline">
          ← Back to all opportunities
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-6 py-32 text-center text-[14px]">{error.message}</div>
    </SiteLayout>
  ),
  component: Detail,
});

function Detail() {
  const o = Route.useLoaderData();
  const related = opportunities.filter((x) => x.category === o.category && x.id !== o.id).slice(0, 3);
  return (
    <SiteLayout>
      <article className="mx-auto max-w-[860px] px-6 py-16">
        <Link to="/opportunities" className="text-[13px] text-muted-foreground hover:text-primary">
          ← All opportunities
        </Link>

        <div className="mt-8 flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center border border-border bg-primary-soft font-serif text-3xl text-primary">
            {o.logo}
          </div>
          <div>
            <div className="text-[13.5px] text-muted-foreground">{o.org}</div>
            <h1 className="mt-1 font-serif text-[44px] leading-[1.1] md:text-[56px]">{o.name}</h1>
            <div className="mt-3 text-[13.5px] text-muted-foreground">
              {o.category} · {o.industry} · {o.location}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
          {[
            ["Funding", o.amount],
            ["Stage", o.stage],
            ["Deadline", o.deadline],
            ["Location", o.location],
          ].map(([k, v]) => (
            <div key={k} className="bg-card p-4">
              <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="mt-1 text-[14.5px]">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <button className="inline-flex h-11 items-center bg-primary px-5 text-[14px] font-medium text-primary-foreground hover:bg-primary-dark">
            Apply Now →
          </button>
          <button className="inline-flex h-11 items-center border border-border bg-background px-5 text-[14px] hover:bg-muted">
            Save Opportunity
          </button>
        </div>

        <div className="prose mt-14 max-w-none">
          <h2 className="font-serif text-[28px]">About this program</h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-foreground/85">{o.description}</p>

          <h2 className="mt-10 font-serif text-[28px]">Eligibility</h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-foreground/85">{o.eligibility}</p>

          <h2 className="mt-10 font-serif text-[28px]">What you get</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15.5px] leading-relaxed text-foreground/85">
            <li>Funding or credits of {o.amount}.</li>
            <li>Access to {o.org}'s partner network and resources.</li>
            <li>Mentorship and program-specific perks.</li>
          </ul>
        </div>

        {related.length > 0 && (
          <div className="mt-20 border-t border-border pt-10">
            <h3 className="font-serif text-[24px]">Related opportunities</h3>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {related.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-border bg-primary-soft font-serif text-base text-primary">
                    {r.logo}
                  </div>
                  <Link
                    to="/opportunities/$id"
                    params={{ id: r.id }}
                    className="flex-1 text-[14px] text-primary hover:underline"
                  >
                    {r.name}
                  </Link>
                  <span className="text-[12px] text-muted-foreground">{r.deadline}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </SiteLayout>
  );
}
