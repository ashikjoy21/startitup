import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { isImageLogo } from "@/lib/org-logos";
import { Route as RootRoute } from "@/routes/__root";
import { saveOpportunity, unsaveOpportunity } from "@/lib/api/auth.functions";
import { getOpportunityById, listOpportunities } from "@/lib/api/opportunities.functions";

export const Route = createFileRoute("/opportunities/$id")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.opportunity
          ? `${loaderData.opportunity.name} — StartItUp.in`
          : "Opportunity — StartItUp.in",
      },
      {
        name: "description",
        content: loaderData?.opportunity?.description
          ? loaderData.opportunity.description.slice(0, 160)
          : "Startup opportunity for Indian founders on StartItUp.in.",
      },
      {
        property: "og:title",
        content: loaderData?.opportunity
          ? `${loaderData.opportunity.name} — StartItUp.in`
          : "Opportunity — StartItUp.in",
      },
      {
        property: "og:description",
        content: loaderData?.opportunity?.description
          ? loaderData.opportunity.description.slice(0, 160)
          : "Startup opportunity for Indian founders on StartItUp.in.",
      },
      {
        property: "og:url",
        content: loaderData?.opportunity
          ? `https://startitup.in/opportunities/${loaderData.opportunity.id}`
          : "https://startitup.in/opportunities",
      },
    ],
    links: loaderData?.opportunity
      ? [{ rel: "canonical", href: `https://startitup.in/opportunities/${loaderData.opportunity.id}` }]
      : [],
    scripts: loaderData?.opportunity
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "GovernmentGrant",
              name: loaderData.opportunity.name,
              description: loaderData.opportunity.description,
              url: `https://startitup.in/opportunities/${loaderData.opportunity.id}`,
              provider: {
                "@type": "Organization",
                name: loaderData.opportunity.org,
              },
              ...(loaderData.opportunity.amount && {
                funding: { "@type": "MonetaryAmount", description: loaderData.opportunity.amount },
              }),
              ...(loaderData.opportunity.deadline && {
                endDate: loaderData.opportunity.deadline,
              }),
              applicationCategory: loaderData.opportunity.category,
              audience: {
                "@type": "Audience",
                audienceType: "Indian startups and founders",
              },
            }),
          },
        ]
      : [],
  }),
  loader: async ({ params }) => {
    const id = decodeURIComponent(params.id);
    const { item } = await getOpportunityById({ data: { id } });

    let related: Awaited<ReturnType<typeof listOpportunities>>["items"] = [];
    try {
      const relatedResult = await listOpportunities({
        data: { category: item.category, limit: 8, offset: 0 },
      });
      related = relatedResult.items.filter((r) => r.id !== item.id).slice(0, 3);
    } catch {
      related = [];
    }

    return { opportunity: item, related };
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Opportunity not found</h1>
        <p className="mt-3 text-[14px] text-muted-foreground">{error.message}</p>
        <Link to="/opportunities" className="mt-6 inline-block text-primary hover:underline">
          ← Back to all opportunities
        </Link>
      </div>
    </SiteLayout>
  ),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { opportunity: o, related } = Route.useLoaderData();
  const { user, savedIds } = RootRoute.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();

  const [isSaved, setIsSaved] = useState(() => savedIds.includes(id));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/opportunities/${id}` } });
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      if (isSaved) {
        await unsaveOpportunity({ data: { opportunityId: id } });
        setIsSaved(false);
      } else {
        await saveOpportunity({ data: { opportunityId: id } });
        setIsSaved(true);
      }
      await router.invalidate();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteLayout>
      <article className="mx-auto max-w-[860px] px-6 py-16">
        <button
          onClick={() => router.history.back()}
          className="text-[13px] text-muted-foreground hover:text-primary"
        >
          ← All opportunities
        </button>

        <div className="mt-8 flex items-start gap-5">
          <OpportunityLogo logo={o.logo} org={o.org} />
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

        <div className="mt-12 flex flex-wrap items-center gap-3">
          {o.sourceUrl ? (
            <a
              href={o.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center bg-primary px-5 text-[14px] font-medium text-primary-foreground hover:bg-primary-dark"
            >
              Apply Now →
            </a>
          ) : (
            <span className="inline-flex h-11 items-center bg-muted px-5 text-[14px] text-muted-foreground">
              Apply link unavailable
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex h-11 items-center border px-5 text-[14px] transition-colors disabled:opacity-50 ${
              isSaved
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {saving ? "Saving…" : !user ? "Sign in to save" : isSaved ? "Saved ✓" : "Save Opportunity"}
          </button>
        </div>
        {saveError && <p className="mt-2 text-[13px] text-destructive">{saveError}</p>}

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
                  <OpportunityLogo logo={r.logo} org={r.org} size="sm" />
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

function OpportunityLogo({
  logo,
  org,
  size = "lg",
}: {
  logo: string;
  org: string;
  size?: "sm" | "lg";
}) {
  const [imgError, setImgError] = useState(false);
  const dim = size === "lg" ? "h-16 w-16 text-3xl" : "h-9 w-9 text-base";
  if (isImageLogo(logo) && !imgError) {
    return (
      <div className={`flex shrink-0 items-center justify-center border border-border bg-primary-soft overflow-hidden ${dim}`}>
        <img
          src={logo}
          alt={org}
          className="h-full w-full object-contain p-1.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-border bg-primary-soft font-serif text-primary ${dim}`}
    >
      {org.charAt(0).toUpperCase()}
    </div>
  );
}
