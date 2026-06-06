import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import type { Opportunity } from "@/lib/opportunities";
import { Route as RootRoute } from "@/routes/__root";
import { saveOpportunity, unsaveOpportunity } from "@/lib/api/auth.functions";

function OrgLogo({ logo, org, size = 12 }: { logo: string; org: string; size?: number }) {
  const px = size * 4;
  const style = { width: px, height: px, minWidth: px };
  const base =
    "flex shrink-0 items-center justify-center border border-border bg-primary-soft overflow-hidden";
  if (logo?.startsWith("http")) {
    return (
      <div className={base} style={style}>
        <img src={logo} alt={org} className="h-full w-full object-contain p-1.5" />
      </div>
    );
  }
  return (
    <div className={`${base} font-serif text-primary`} style={{ ...style, fontSize: px * 0.45 }}>
      {org.charAt(0).toUpperCase()}
    </div>
  );
}

export { OrgLogo };

export function OpportunityRow({ o }: { o: Opportunity }) {
  const { user, savedIds } = RootRoute.useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaved, setIsSaved] = useState(() => savedIds.includes(o.id));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) {
      navigate({ to: "/login", search: { redirect: location.pathname } });
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await unsaveOpportunity({ data: { opportunityId: o.id } });
        setIsSaved(false);
      } else {
        await saveOpportunity({ data: { opportunityId: o.id } });
        setIsSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 border border-border bg-card p-5 md:flex-row md:items-center">
      <div className="flex flex-1 items-start gap-4">
        <OrgLogo logo={o.logo} org={o.org} size={12} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 text-[13.5px]">
            <span className="font-semibold text-foreground">{o.org}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{o.short}</span>
          </div>
          <Link
            to="/opportunities/$id"
            params={{ id: o.id }}
            className="mt-1 block text-[15px] font-medium text-primary hover:underline"
          >
            {o.name}
          </Link>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
            <span>{o.category}</span>
            <span>·</span>
            <span>{o.industry}</span>
            <span>·</span>
            <span>{o.amount}</span>
            <span>·</span>
            <span>Deadline: {o.deadline}</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          aria-label={isSaved ? "Unsave opportunity" : "Save opportunity"}
          className={`h-9 border px-3 text-[13px] transition-colors disabled:opacity-50 ${
            isSaved
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          {isSaved ? "Saved ✓" : "Save"}
        </button>
        <Link
          to="/opportunities/$id"
          params={{ id: o.id }}
          className="inline-flex h-9 items-center bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary-dark"
        >
          View details
        </Link>
        {o.sourceUrl && (
          <a
            href={o.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center border border-primary px-4 text-[13px] font-medium text-primary hover:bg-primary/5"
          >
            Apply →
          </a>
        )}
      </div>
    </div>
  );
}
