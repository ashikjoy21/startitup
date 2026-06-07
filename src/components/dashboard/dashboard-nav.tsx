import { Link } from "@tanstack/react-router";

const TAB_ITEMS = [
  { id: "overview", label: "Dashboard" },
  { id: "pipeline", label: "Pipeline" },
  { id: "calendar", label: "Calendar" },
  { id: "matches", label: "Matches" },
  { id: "saved", label: "Saved" },
] as const;

export type DashboardTab = (typeof TAB_ITEMS)[number]["id"];
export type DashboardNavId = DashboardTab | "profile";

type Props = {
  active: DashboardNavId;
};

function navClass(isActive: boolean) {
  return [
    "shrink-0 border-b-2 px-4 py-3 text-[13px] font-medium transition-colors",
    isActive
      ? "border-primary text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground",
  ].join(" ");
}

export function DashboardNav({ active }: Props) {
  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-[1280px] px-6">
        <nav className="flex overflow-x-auto">
          {TAB_ITEMS.map(({ id, label }) => (
            <Link
              key={id}
              to="/dashboard"
              search={id === "overview" ? {} : { tab: id }}
              className={navClass(active === id)}
            >
              {label}
            </Link>
          ))}
          <Link to="/profile" className={navClass(active === "profile")}>
            Profile
          </Link>
        </nav>
      </div>
    </div>
  );
}
