export type DeadlineUrgency =
  | "rolling"
  | "closing_week"
  | "closing_month"
  | "closing_later"
  | "closed";

export type DeadlineFilter = "all" | DeadlineUrgency;

export const DEADLINE_FILTER_OPTIONS: { id: DeadlineFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rolling", label: "Rolling / Open" },
  { id: "closing_week", label: "Closing this week" },
  { id: "closing_month", label: "Closing this month" },
  { id: "closing_later", label: "Closing later" },
  { id: "closed", label: "Closed" },
];

const ROLLING_RE =
  /rolling|open|ongoing|tba|tbd|n\/a|cohort|annual|varies|event-based|always/i;

const MS_DAY = 86_400_000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function parseOpportunityDeadline(s: string): Date | null {
  if (!s || s === "—") return null;
  const trimmed = s.trim();

  const relative = trimmed.match(/closes?\s+in\s+(\d+)\s*d(?:ays?)?/i);
  if (relative) {
    const d = new Date();
    d.setDate(d.getDate() + Number(relative[1]));
    return d;
  }

  if (ROLLING_RE.test(trimmed)) return null;

  const direct = new Date(trimmed);
  if (!isNaN(direct.getTime())) return direct;

  const dmy = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dmy) {
    const d = new Date(`${dmy[2]} ${dmy[1]}, ${dmy[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  const mdy = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (mdy) {
    const d = new Date(`${mdy[1]} ${mdy[2]}, ${mdy[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  const dayMonthYear = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (dayMonthYear) {
    const d = new Date(`${dayMonthYear[2]} ${dayMonthYear[1]}, ${dayMonthYear[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  const monthYear = trimmed.match(/([A-Za-z]+)\s+(\d{4})/);
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }
  }

  return null;
}

export function classifyDeadline(deadline: string, now = new Date()): DeadlineUrgency {
  if (!deadline || deadline === "—" || ROLLING_RE.test(deadline)) return "rolling";

  const parsed = parseOpportunityDeadline(deadline);
  if (!parsed) return "rolling";

  const days = Math.ceil((startOfDay(parsed).getTime() - startOfDay(now).getTime()) / MS_DAY);

  if (days < 0) return "closed";
  if (days <= 7) return "closing_week";
  if (days <= 30) return "closing_month";
  return "closing_later";
}

export function deadlineUrgencyLabel(urgency: DeadlineUrgency): string {
  switch (urgency) {
    case "rolling":
      return "Rolling";
    case "closing_week":
      return "Closing soon";
    case "closing_month":
      return "Closing this month";
    case "closing_later":
      return "Fixed date";
    case "closed":
      return "Closed";
  }
}
