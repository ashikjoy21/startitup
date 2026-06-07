import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { UpcomingDeadline } from "@/lib/api/auth.functions";

type Props = {
  deadlines: UpcomingDeadline[];
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function formatDayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildMonthGrid(viewDate: Date): (string | null)[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Monday-based week: Mon=0 … Sun=6
  const startPad = (first.getDay() + 6) % 7;
  const cells: (string | null)[] = [];

  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let day = 1; day <= last.getDate(); day++) {
    cells.push(toDateKey(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function DeadlineListItem({ d }: { d: UpcomingDeadline }) {
  const urgency =
    d.daysUntil <= 7
      ? "bg-red-50 text-red-600"
      : d.daysUntil <= 30
        ? "bg-amber-50 text-amber-700"
        : "bg-muted text-muted-foreground";

  return (
    <li className="flex items-start justify-between gap-4 border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {d.org}
        </p>
        <p className="mt-0.5 font-medium leading-snug">{d.name}</p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">{d.deadline}</p>
        {d.isSaved && <span className="mt-1 inline-block text-[11px] text-primary">Saved</span>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className={`px-2 py-0.5 text-[11px] font-medium ${urgency}`}>
          {d.daysUntil === 0 ? "Today" : d.daysUntil === 1 ? "Tomorrow" : `${d.daysUntil}d`}
        </span>
        <Link
          to="/opportunities/$id"
          params={{ id: d.id }}
          className="text-[12px] text-primary hover:underline"
        >
          View details →
        </Link>
      </div>
    </li>
  );
}

export function DeadlineCalendar({ deadlines }: Props) {
  const todayKey = toDateKey(new Date());
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(todayKey);
  const [savedOnly, setSavedOnly] = useState(false);

  const filtered = useMemo(
    () => (savedOnly ? deadlines.filter((d) => d.isSaved) : deadlines),
    [deadlines, savedOnly],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, UpcomingDeadline[]>();
    for (const d of filtered) {
      const key = toDateKey(new Date(d.deadlineDate));
      const list = map.get(key) ?? [];
      list.push(d);
      map.set(key, list);
    }
    return map;
  }, [filtered]);

  const monthCells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const monthDeadlineCount = useMemo(() => {
    const prefix = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`;
    let count = 0;
    for (const [key, items] of byDay) {
      if (key.startsWith(prefix)) count += items.length;
    }
    return count;
  }, [byDay, viewDate]);

  const selectedDeadlines = selectedDay ? (byDay.get(selectedDay) ?? []) : [];

  function shiftMonth(delta: number) {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function goToToday() {
    const now = new Date();
    setViewDate(now);
    setSelectedDay(todayKey);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-[28px]">Deadline Calendar</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {filtered.length} upcoming deadline{filtered.length !== 1 ? "s" : ""} with fixed dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSavedOnly(false)}
            className={
              "border px-3 py-1.5 text-[12.5px] " +
              (!savedOnly
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSavedOnly(true)}
            className={
              "border px-3 py-1.5 text-[12.5px] " +
              (savedOnly
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            Saved only
          </button>
        </div>
      </div>

      <div className="mt-6 border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="px-2 py-1 text-[18px] text-muted-foreground hover:text-foreground"
            aria-label="Previous month"
          >
            ‹
          </button>
          <div className="text-center">
            <p className="font-serif text-[22px]">{formatMonthYear(viewDate)}</p>
            <p className="text-[11.5px] text-muted-foreground">
              {monthDeadlineCount} deadline{monthDeadlineCount !== 1 ? "s" : ""} this month
            </p>
          </div>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="px-2 py-1 text-[18px] text-muted-foreground hover:text-foreground"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthCells.map((key, idx) => {
            if (!key) {
              return <div key={`empty-${idx}`} className="min-h-[88px] border-b border-r border-border bg-muted/10" />;
            }

            const items = byDay.get(key) ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selectedDay;
            const dayNum = Number(key.split("-")[2]);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(key)}
                className={[
                  "min-h-[88px] border-b border-r border-border p-2 text-left transition-colors",
                  isSelected ? "bg-primary/8 ring-1 ring-inset ring-primary/30" : "hover:bg-muted/40",
                  items.length > 0 ? "cursor-pointer" : "cursor-default",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-flex size-7 items-center justify-center text-[13px] font-medium",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                  ].join(" ")}
                >
                  {dayNum}
                </span>
                {items.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {items.slice(0, 2).map((d) => (
                      <p
                        key={d.id}
                        className="truncate text-[10px] leading-tight text-primary"
                        title={d.name}
                      >
                        {d.name}
                      </p>
                    ))}
                    {items.length > 2 && (
                      <p className="text-[10px] text-muted-foreground">+{items.length - 2} more</p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end border-t border-border px-4 py-2">
          <button
            type="button"
            onClick={goToToday}
            className="text-[12px] text-primary hover:underline"
          >
            Today
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-serif text-[20px]">
          {selectedDay ? formatDayLabel(selectedDay) : "Select a date"}
        </h3>
        {selectedDay && selectedDeadlines.length === 0 ? (
          <p className="mt-3 text-[13.5px] text-muted-foreground">No deadlines on this date.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {selectedDeadlines.map((d) => (
              <DeadlineListItem key={d.id} d={d} />
            ))}
          </ul>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-[13.5px] text-muted-foreground">
          No fixed deadlines found. Rolling programs are not shown on the calendar.
        </p>
      )}
    </div>
  );
}
