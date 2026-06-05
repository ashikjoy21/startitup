import { Link } from "@tanstack/react-router";

const opportunityNav = [
  { label: "All", search: {} },
  { label: "Credits", search: { category: "Startup Credits" } },
  { label: "Grants", search: { category: "Grants" } },
  { label: "Gov Schemes", search: { category: "Government Schemes" } },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center bg-primary font-serif text-base text-primary-foreground">
            S
          </span>
          <span className="text-[15px] font-medium tracking-tight">StartItUp.in</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {opportunityNav.map((item) => (
            <Link
              key={item.label}
              to="/opportunities"
              search={item.search}
              className="text-[13.5px] text-foreground/85 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/incubators"
            className="text-[13.5px] text-foreground/85 hover:text-primary"
          >
            Incubators
          </Link>
          <Link
            to="/accelerators"
            className="text-[13.5px] text-foreground/85 hover:text-primary"
          >
            Accelerators
          </Link>
          <Link
            to="/resources"
            className="text-[13.5px] text-foreground/85 hover:text-primary"
          >
            Resources
          </Link>
          <Link
            to="/success-stories"
            className="text-[13.5px] text-foreground/85 hover:text-primary"
          >
            Stories
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/submit" className="hidden text-[13.5px] text-foreground/85 hover:text-primary md:inline">
            Suggest
          </Link>
          <Link
            to="/submit"
            className="inline-flex h-9 items-center bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark"
          >
            Submit Opportunity
          </Link>
        </div>
      </div>
    </header>
  );
}
