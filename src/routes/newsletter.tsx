import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/newsletter")({
  head: () => ({ meta: [{ title: "Newsletter Archive — StartItUp.in" }] }),
  component: Newsletter,
});

const issues = [
  { n: 42, date: "Dec 2, 2026", title: "10 new India-only grants worth ₹120 Cr", excerpt: "BIRAC opens BIG round 24, Karnataka announces Elevate '26, and a fresh DPIIT scheme for D2C founders." },
  { n: 41, date: "Nov 25, 2026", title: "AWS Activate just doubled credits for AI startups", excerpt: "Plus: Microsoft for Startups now includes OpenAI credits, and Peak XV Surge opens applications." },
  { n: 40, date: "Nov 18, 2026", title: "The complete guide to Indian government schemes", excerpt: "An editorial breakdown of every active central and state-level startup scheme — eligibility, ticket size, timeline." },
  { n: 39, date: "Nov 11, 2026", title: "Fellowships for Indian founders, ranked", excerpt: "Chevening, Schmidt Futures, Echoing Green, MITx — what's worth applying to, and what isn't." },
  { n: 38, date: "Nov 4, 2026", title: "₹50L grants you've probably never heard of", excerpt: "Five state-level grants with low applicant volume and high acceptance rates." },
  { n: 37, date: "Oct 28, 2026", title: "Accelerator season is here", excerpt: "YC, Techstars, Antler, 100X.VC — application deadlines and the founders' shortlist." },
];

function Newsletter() {
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[860px] px-6 py-20 text-center">
          <div className="text-[13px] text-muted-foreground">Newsletter</div>
          <h1 className="mt-2 font-serif text-[52px] leading-[1.05] md:text-[68px]">
            The <em className="italic text-primary">Weekly Brief</em>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] text-foreground/75">
            Every Wednesday — new credits, grants, and programs for Indian founders. No fluff.
          </p>
          <form className="mx-auto mt-8 flex max-w-md gap-2">
            <input
              placeholder="you@startup.in"
              className="h-11 flex-1 border border-border bg-card px-3 text-[14px] outline-none focus:border-primary"
            />
            <button className="inline-flex h-11 items-center bg-primary px-5 text-[14px] font-medium text-primary-foreground hover:bg-primary-dark">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-[860px] px-6 py-16">
        <h2 className="font-serif text-[32px]">Archive</h2>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {issues.map((i) => (
            <li key={i.n} className="grid gap-2 py-8 md:grid-cols-[120px_1fr]">
              <div className="text-[12.5px] text-muted-foreground">
                #{i.n}
                <br />
                {i.date}
              </div>
              <div>
                <a href="#" className="font-serif text-[26px] leading-tight text-foreground hover:text-primary">
                  {i.title}
                </a>
                <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/75">{i.excerpt}</p>
                <a href="#" className="mt-3 inline-block text-[13px] text-primary hover:underline">
                  Read issue →
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </SiteLayout>
  );
}
