import { formatInrCompact } from "@/lib/parse-opportunity-amount";

type Props = {
  savedCount: number;
  appliedCount: number;
  deadlinesThisWeek: number;
  potentialFundingInr: number;
};

export function DashboardMetrics({
  savedCount,
  appliedCount,
  deadlinesThisWeek,
  potentialFundingInr,
}: Props) {
  const fundingValue = potentialFundingInr > 0 ? formatInrCompact(potentialFundingInr) : "—";

  const items = [
    { value: String(savedCount), label: "Saved" },
    { value: String(appliedCount), label: "Applied" },
    { value: String(deadlinesThisWeek), label: "Deadlines This Week" },
    { value: fundingValue, label: "Funding in reach" },
  ];

  return (
    <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
      {items.map(({ value, label }) => (
        <div key={label} className="bg-card p-5">
          <div className="font-serif text-[32px] leading-none">{value}</div>
          <div className="mt-2 text-[12px] text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  );
}
