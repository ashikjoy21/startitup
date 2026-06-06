import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function SiteHeader() {
  const [dirOpen, setDirOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">

        {/* Left items */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/opportunities" className="text-[13.5px] text-foreground/80 hover:text-foreground">
            Opportunities
          </Link>

          <div
            className="relative"
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDirOpen(false); }}
          >
            <button
              onClick={() => setDirOpen((v) => !v)}
              onKeyDown={(e) => { if (e.key === "Escape") setDirOpen(false); }}
              aria-expanded={dirOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 text-[13.5px] text-foreground/80 hover:text-foreground"
            >
              Directories
              <svg aria-hidden="true" className={`h-3 w-3 transition-transform ${dirOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dirOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-sm border border-border bg-background shadow-sm">
                <Link to="/incubators" onClick={() => setDirOpen(false)} className="block px-4 py-2.5 text-[13.5px] text-foreground/80 hover:bg-muted hover:text-foreground">Incubators</Link>
                <Link to="/accelerators" onClick={() => setDirOpen(false)} className="block px-4 py-2.5 text-[13.5px] text-foreground/80 hover:bg-muted hover:text-foreground">Accelerators</Link>
              </div>
            )}
          </div>

          <Link to="/resources" className="text-[13.5px] text-foreground/80 hover:text-foreground">
            Resources
          </Link>
        </div>

        {/* Centered logo — just the square, no wordmark */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="flex h-8 w-8 items-center justify-center bg-primary font-serif text-[15px] text-primary-foreground">
            S
          </span>
        </Link>

        {/* Right items */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/success-stories" className="text-[13.5px] text-foreground/80 hover:text-foreground">
            Stories
          </Link>
          <Link to="/submit" className="text-[13.5px] text-foreground/80 hover:text-foreground">
            Submit
          </Link>
          <Link to="/opportunities" className="inline-flex h-9 items-center bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark">
            Explore →
          </Link>
        </div>

        {/* Mobile — logo left, explore right */}
        <Link to="/" className="flex md:hidden">
          <span className="flex h-8 w-8 items-center justify-center bg-primary font-serif text-[15px] text-primary-foreground">S</span>
        </Link>
        <Link to="/opportunities" className="inline-flex h-9 items-center bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark md:hidden">
          Explore →
        </Link>
      </div>
    </header>
  );
}
