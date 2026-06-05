import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { OrgLogo } from "@/components/opportunity-row";
import { getGuide, getNextGuide } from "@/lib/guides";
import { seedOpportunities } from "@/lib/opportunities";

export const Route = createFileRoute("/resources/$slug")({
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.guide.title ?? "Guide"} — StartItUp.in` },
      { name: "description", content: loaderData?.guide.description ?? "" },
    ],
  }),
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    const related = seedOpportunities
      .filter((o) => guide.relatedCategories.includes(o.category))
      .slice(0, 3);
    const next = getNextGuide(params.slug);
    return { guide, related, next };
  },
  component: GuidePage,
});

function GuidePage() {
  const { guide, related, next } = Route.useLoaderData();
  const [activeSection, setActiveSection] = useState(guide.sections[0]?.id ?? "");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionIds = guide.sections.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [guide.sections]);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-[1100px] px-6 py-14">
        {/* Back link */}
        <Link to="/resources" className="text-[13px] text-muted-foreground hover:text-primary">
          ← Resources
        </Link>

        {/* Title block */}
        <div className="mx-auto mt-10 max-w-[680px] text-center">
          <h1 className="font-serif text-[48px] italic leading-[1.1] md:text-[56px]">
            {guide.title}
          </h1>
          <p className="mt-3 text-[13px] text-muted-foreground">
            By {guide.source} · {guide.readTime}
          </p>
        </div>

        {/* Two-column: TOC + Content */}
        <div className="mt-14 flex gap-16">
          {/* Sticky TOC */}
          <aside className="hidden w-44 shrink-0 lg:block">
            <nav className="sticky top-8">
              <div className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                Contents
              </div>
              <ul className="space-y-2">
                {guide.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`block text-[13px] leading-snug transition-colors hover:text-primary ${
                        activeSection === s.id
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Guide content */}
          <div ref={contentRef} className="min-w-0 flex-1">
            {guide.sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-12 scroll-mt-8">
                <h2 className="font-serif text-[28px] leading-tight">{section.heading}</h2>
                {section.body && (
                  <div className="mt-4 space-y-4">
                    {section.body.split("\n\n").filter(Boolean).map((para, i) => (
                      <p key={i} className="text-[15.5px] leading-relaxed text-foreground/85">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-4 list-disc space-y-2 pl-5">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="text-[15.5px] leading-relaxed text-foreground/85">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>

        {/* Related opportunities */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-border pt-10">
            <h3 className="font-serif text-[24px]">Related Opportunities</h3>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {related.map((o) => (
                <li key={o.id} className="flex items-center gap-3 py-3">
                  <OrgLogo logo={o.logo} org={o.org} size={9} />
                  <div className="flex-1">
                    <Link
                      to="/opportunities/$id"
                      params={{ id: o.id }}
                      className="text-[14px] text-primary hover:underline"
                    >
                      {o.name}
                    </Link>
                    <div className="text-[12px] text-muted-foreground">
                      {o.org} · {o.amount}
                    </div>
                  </div>
                  <span className="text-[12px] text-muted-foreground">{o.deadline}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next guide */}
        {next && (
          <div className="mt-12 border-t border-border pt-10">
            <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
              Up next
            </div>
            <Link
              to="/resources/$slug"
              params={{ slug: next.slug }}
              className="mt-2 block font-serif text-[26px] text-primary hover:underline"
            >
              {next.title} →
            </Link>
          </div>
        )}
      </article>
    </SiteLayout>
  );
}
