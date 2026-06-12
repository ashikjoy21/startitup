import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { successStories, SECTORS, type Sector } from "@/lib/success-stories";

export const Route = createFileRoute("/success-stories")({
  head: () => ({
    meta: [
      { title: "Success Stories — StartItUp" },
      {
        name: "description",
        content:
          "National Startup Award winners from 2021–2024 — real Indian startups building for India.",
      },
    ],
  }),
  component: SuccessStories,
});

function SuccessStories() {
  const [activeSector, setActiveSector] = useState<Sector>("All");

  const filtered =
    activeSector === "All"
      ? successStories
      : successStories.filter((s) => s.sector === activeSector);

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="text-[13px] text-muted-foreground">Success Stories</div>
          <h1 className="mt-2 font-serif text-[48px] leading-tight md:text-[60px]">
            Startups reshaping India.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-foreground/75">
            National Startup Award winners from 2021 to 2024 — recognised by DPIIT for exceptional
            innovation and measurable social impact.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        {/* Sector filter */}
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((sector) => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              className={`h-8 rounded-full px-4 text-[13px] transition-colors ${
                activeSector === sector
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground/85 hover:border-primary hover:text-primary"
              }`}
            >
              {sector}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-8 text-[13px] text-muted-foreground">
          Showing {filtered.length} startup{filtered.length !== 1 ? "s" : ""}
          {activeSector !== "All" ? ` in ${activeSector}` : ""}
        </div>

        {/* Cards grid */}
        <div className="mt-6 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((story) => (
            <div
              key={`${story.name}-${story.year}`}
              className="flex flex-col justify-between bg-card p-6"
            >
              <div>
                <h2 className="font-serif text-[20px] leading-snug">{story.name}</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  {story.tagline}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="inline-flex h-6 items-center rounded-full border border-border bg-muted px-3 text-[11.5px] text-muted-foreground">
                  {story.sector}
                </span>
                <span className="text-[12px] text-muted-foreground">{story.award}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
