import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function SiteHeader() {
  const [dirOpen, setDirOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center px-6">
        {/* Left nav */}
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link
            to="/opportunities"
            className="text-[13.5px] text-foreground/85 hover:text-primary"
          >
            Opportunities
          </Link>

          {/* Directories dropdown */}
          <div className="relative">
            <button
              onClick={() => setDirOpen((v) => !v)}
              onBlur={() => setTimeout(() => setDirOpen(false), 150)}
              className="flex items-center gap-1 text-[13.5px] text-foreground/85 hover:text-primary"
            >
              Directories
              <svg
                className={`h-3 w-3 transition-transform ${dirOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dirOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-40 border border-border bg-background shadow-sm">
                <Link
                  to="/incubators"
                  className="block px-4 py-2.5 text-[13.5px] text-foreground/85 hover:bg-muted hover:text-primary"
                  onClick={() => setDirOpen(false)}
                >
                  Incubators
                </Link>
                <Link
                  to="/accelerators"
                  className="block px-4 py-2.5 text-[13.5px] text-foreground/85 hover:bg-muted hover:text-primary"
                  onClick={() => setDirOpen(false)}
                >
                  Accelerators
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/resources"
            className="text-[13.5px] text-foreground/85 hover:text-primary"
          >
            Resources
          </Link>
        </nav>

        {/* Centered logo */}
        <div className="flex flex-1 justify-center md:flex-none">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center bg-primary font-serif text-base text-primary-foreground">
              S
            </span>
            <span className="text-[15px] font-medium tracking-tight">StartItUp.in</span>
          </Link>
        </div>

        {/* Right nav */}
        <div className="hidden flex-1 items-center justify-end gap-6 md:flex">
          <Link
            to="/success-stories"
            className="text-[13.5px] text-foreground/85 hover:text-primary"
          >
            Stories
          </Link>
          <Link
            to="/submit"
            className="text-[13.5px] text-foreground/85 hover:text-primary"
          >
            Submit
          </Link>
          <Link
            to="/opportunities"
            className="inline-flex h-9 items-center bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark"
          >
            Explore →
          </Link>
        </div>

        {/* Mobile — just logo + explore */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            to="/opportunities"
            className="inline-flex h-9 items-center bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark"
          >
            Explore →
          </Link>
        </div>
      </div>
    </header>
  );
}
