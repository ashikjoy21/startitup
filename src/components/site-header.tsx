import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Route as RootRoute } from "@/routes/__root";

export function SiteHeader() {
  const { user } = RootRoute.useLoaderData();
  const [dirOpen, setDirOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const name = user?.user_metadata?.name as string | undefined;
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <header className="border-b border-border bg-background">
      <div className="relative mx-auto flex h-16 max-w-[1280px] items-center px-6">

        {/* Left nav */}
        <div className="hidden flex-1 items-center justify-center gap-10 md:flex">
          <Link to="/opportunities" className="text-[13.5px] text-foreground/75 hover:text-foreground">
            Opportunities
          </Link>

          <div
            className="relative"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setDirOpen(false);
            }}
          >
            <button
              onClick={() => setDirOpen((v) => !v)}
              onKeyDown={(e) => { if (e.key === "Escape") setDirOpen(false); }}
              aria-expanded={dirOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 text-[13.5px] text-foreground/75 hover:text-foreground"
            >
              Directories
              <svg
                aria-hidden="true"
                className={`h-3 w-3 transition-transform ${dirOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dirOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-sm border border-border bg-background shadow-sm">
                <Link
                  to="/incubators"
                  onClick={() => setDirOpen(false)}
                  className="block px-4 py-2.5 text-[13.5px] text-foreground/75 hover:bg-muted hover:text-foreground"
                >
                  Incubators
                </Link>
                <Link
                  to="/accelerators"
                  onClick={() => setDirOpen(false)}
                  className="block px-4 py-2.5 text-[13.5px] text-foreground/75 hover:bg-muted hover:text-foreground"
                >
                  Accelerators
                </Link>
              </div>
            )}
          </div>

          <Link to="/resources" className="text-[13.5px] text-foreground/75 hover:text-foreground">
            Resources
          </Link>
        </div>

        {/* Centered logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="flex h-8 w-8 items-center justify-center bg-primary font-serif text-[15px] text-primary-foreground">
            S
          </span>
        </Link>

        {/* Right nav */}
        <div className="hidden flex-1 items-center justify-center gap-10 md:flex">
          <Link to="/success-stories" className="text-[13.5px] text-foreground/75 hover:text-foreground">
            Stories
          </Link>
          <Link to="/submit" className="text-[13.5px] text-foreground/75 hover:text-foreground">
            Submit
          </Link>

          {user ? (
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                aria-expanded={avatarOpen}
                aria-haspopup="true"
                aria-label={name ? `${name} menu` : "User menu"}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-[13px] text-primary-foreground">
                    {initial}
                  </span>
                )}
              </button>
              {avatarOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-sm border border-border bg-background shadow-sm">
                  <Link
                    to="/dashboard"
                    onClick={() => setAvatarOpen(false)}
                    className="block px-4 py-2.5 text-[13.5px] text-foreground/75 hover:bg-muted hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setAvatarOpen(false)}
                    className="block px-4 py-2.5 text-[13.5px] text-foreground/75 hover:bg-muted hover:text-foreground"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    search={{ tab: "saved" }}
                    onClick={() => setAvatarOpen(false)}
                    className="block px-4 py-2.5 text-[13.5px] text-foreground/75 hover:bg-muted hover:text-foreground"
                  >
                    Saved
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <Link
                    to="/logout"
                    onClick={() => setAvatarOpen(false)}
                    className="block px-4 py-2.5 text-[13.5px] text-foreground/75 hover:bg-muted hover:text-foreground"
                  >
                    Sign out
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              search={{ redirect: undefined }}
              className="text-[13.5px] font-medium text-primary hover:underline"
            >
              Sign in →
            </Link>
          )}
        </div>

        {/* Mobile: logo + auth link */}
        <Link to="/" className="flex md:hidden">
          <span className="flex h-8 w-8 items-center justify-center bg-primary font-serif text-[15px] text-primary-foreground">
            S
          </span>
        </Link>
        <div className="ml-auto flex items-center md:hidden">
          {user ? (
            <Link to="/dashboard" className="text-[13.5px] font-medium text-primary">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" search={{ redirect: undefined }} className="text-[13.5px] font-medium text-primary">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
