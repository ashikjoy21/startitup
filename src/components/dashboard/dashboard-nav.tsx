import { Link } from "@tanstack/react-router";

const TAB_ITEMS = [
  { id: "overview", label: "Dashboard" },
  { id: "pipeline", label: "Pipeline" },
  { id: "calendar", label: "Calendar" },
  { id: "matches", label: "Matches" },
] as const;

export type DashboardTab = (typeof TAB_ITEMS)[number]["id"];

type Props = {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
};

export function DashboardNav({ active, onChange }: Props) {
  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-[1280px] px-6">
        <nav className="flex overflow-x-auto">
          {TAB_ITEMS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={[
                "shrink-0 border-b-2 px-4 py-3 text-[13px] font-medium transition-colors",
                active === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
          <Link
            to="/saved"
            className="shrink-0 border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            Saved
          </Link>
          <Link
            to="/profile"
            className="shrink-0 border-b-2 border-transparent px-4 py-3 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            Profile
          </Link>
        </nav>
      </div>
    </div>
  );
}
