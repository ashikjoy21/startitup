import { Link } from "@tanstack/react-router";

const nav = [
  { to: "/opportunities", label: "Opportunities" },
  { to: "/opportunities", label: "Credits" },
  { to: "/opportunities", label: "Grants" },
  { to: "/opportunities", label: "Accelerators" },
  { to: "/newsletter", label: "Resources" },
  { to: "/calculator", label: "About" },
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
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item, i) => (
            <Link
              key={i}
              to={item.to as any}
              className="text-[13.5px] text-foreground/85 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hidden text-[13.5px] text-foreground/85 hover:text-primary md:inline">
            Sign In
          </Link>
          <Link
            to="/profile"
            className="inline-flex h-9 items-center bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
