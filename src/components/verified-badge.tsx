import { useEffect, useState } from "react";
import { verifiedLabel } from "@/lib/jobs-search";

type VerifiedBadgeProps = {
  at: string | null;
  org?: string;
  size?: "sm" | "md";
};

export function VerifiedBadge({ at, org, size = "sm" }: VerifiedBadgeProps) {
  const [label, setLabel] = useState<ReturnType<typeof verifiedLabel>>(null);
  const [localTime, setLocalTime] = useState<string | null>(null);

  useEffect(() => {
    setLabel(verifiedLabel(at));
    if (at) setLocalTime(new Date(at).toLocaleString());
  }, [at]);

  if (!at || !label) return null;

  const title = `We last saw this role open on ${org ? `${org}'s` : "the employer's"} own careers site at ${localTime ?? at}. Closed roles are removed automatically.`;
  const textSize = size === "md" ? "text-[13px]" : "text-[12px]";

  return (
    <span
      className={`${textSize} ${label.fresh ? "text-primary" : "text-muted-foreground"}`}
      title={title}
    >
      {label.fresh && <span aria-hidden="true">✓ </span>}
      {label.text}
      {label.fresh && size === "md" && org && ` on ${org}'s site`}
    </span>
  );
}
