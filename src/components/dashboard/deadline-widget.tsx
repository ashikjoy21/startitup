import { Link } from "@tanstack/react-router";
import type { UpcomingDeadline } from "@/lib/api/auth.functions";

type Props = {
  deadlines: UpcomingDeadline[];
};

export function DeadlineWidget({ deadlines }: Props) {
  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-serif text-[20px]">Upcoming Deadlines</h3>
      </div>
      {deadlines.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-[13px] text-muted-foreground">No upcoming deadlines.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {deadlines.map((d) => (
            <li key={d.id} className="flex items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium">{d.name}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{d.deadline}</p>
                {d.isSaved && (
                  <span className="mt-1 inline-block text-[11px] text-primary">Saved</span>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={[
                    "px-2 py-0.5 text-[11px] font-medium",
                    d.daysUntil <= 7
                      ? "bg-red-50 text-red-600"
                      : d.daysUntil <= 30
                        ? "bg-amber-50 text-amber-700"
                        : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {d.daysUntil === 0
                    ? "Today"
                    : d.daysUntil === 1
                      ? "Tomorrow"
                      : `${d.daysUntil}d`}
                </span>
                <Link
                  to="/opportunities/$id"
                  params={{ id: d.id }}
                  className="text-[11.5px] text-primary hover:underline"
                >
                  View →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
