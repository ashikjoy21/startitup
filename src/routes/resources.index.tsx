import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { guides } from "@/lib/guides";

export const Route = createFileRoute("/resources/")({
  head: () => ({
    meta: [
      { title: "Resources — StartItUp.in" },
      {
        name: "description",
        content:
          "Practical guides for Indian founders — DPIIT recognition, tax benefits, business entities, and government schemes explained.",
      },
    ],
  }),
  loader: () => guides,
  component: ResourcesIndex,
});

function ResourcesIndex() {
  const guideList = Route.useLoaderData();

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="text-[13px] text-muted-foreground">Resources</div>
          <h1 className="mt-2 font-serif text-[48px] leading-tight md:text-[60px]">
            Guides for Indian founders.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-foreground/75">
            Plain-English explanations of DPIIT recognition, tax benefits, funding schemes, and
            everything else you need to navigate India's startup ecosystem.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {guideList.map((guide) => (
            <Link
              key={guide.slug}
              to="/resources/$slug"
              params={{ slug: guide.slug }}
              className="group flex h-64 flex-col justify-between bg-card p-6 hover:bg-primary-soft"
            >
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {guide.readTime}
                </div>
                <h2 className="mt-3 font-serif text-[22px] leading-snug group-hover:text-primary">
                  {guide.title}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
                  {guide.description}
                </p>
              </div>
              <div className="text-[12.5px] text-primary opacity-0 group-hover:opacity-100">
                Read guide →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
