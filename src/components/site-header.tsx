import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Route as RootRoute } from "@/routes/__root";
import { modeForPathname, siteModeCookie } from "@/lib/site-mode";

const linkClass = "text-[13.5px] text-foreground/75 hover:text-foreground";

export function SiteHeader() {
  const { user } = RootRoute.useLoaderData();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isChoice = pathname === "/";
  const mode = modeForPathname(pathname);
  const [dirOpen, setDirOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const name = user?.user_metadata?.name as string | undefined;
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "U";
  const home = isChoice ? "/" : mode === "career" ? "/career" : "/business";
  const switcher = (
    <div
      className="inline-flex border border-border text-[11px] md:text-[12px]"
      aria-label="Choose site"
    >
      {(["business", "career"] as const).map((side) => (
        <Link
          key={side}
          to={side === "business" ? "/business" : "/career"}
          onClick={() => {
            if (side !== mode) document.cookie = siteModeCookie(side);
          }}
          aria-current={!isChoice && mode === side ? "page" : undefined}
          aria-pressed={!isChoice && mode === side}
          className={`px-2 py-1.5 capitalize focus-visible:outline-2 focus-visible:outline-primary md:px-3 ${!isChoice && mode === side ? "bg-primary text-primary-foreground" : "text-foreground/75 hover:bg-primary-soft"}`}
        >
          {side === "business" ? "Business" : "Career"}
        </Link>
      ))}
    </div>
  );

  return (
    <header className="border-b border-border bg-background">
      <div className="relative mx-auto flex h-16 max-w-[1280px] items-center px-4 md:px-6">
        <Link to={home} className="z-10 flex shrink-0 md:hidden" aria-label="StartItUp home">
          <span className="flex h-8 w-8 items-center justify-center bg-primary font-serif text-[15px] text-primary-foreground">
            S
          </span>
        </Link>

        {!isChoice && mode === "business" && (
          <nav className="hidden w-1/2 items-center justify-center gap-6 pr-12 md:flex lg:gap-8">
            <Link to="/opportunities" className={linkClass}>
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
                onKeyDown={(e) => {
                  if (e.key === "Escape") setDirOpen(false);
                }}
                aria-expanded={dirOpen}
                aria-haspopup="true"
                className={linkClass}
              >
                Directories⌄
              </button>
              {dirOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-44 border border-border bg-background shadow-sm">
                  {[
                    ["Incubators", "/incubators"],
                    ["Accelerators", "/accelerators"],
                    ["Investors", "/investors"],
                    ["Funding rounds", "/funding"],
                    ["Funded startups", "/startups"],
                  ].map(([label, to]) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setDirOpen(false)}
                      className="block px-4 py-2.5 text-[13.5px] text-foreground/75 hover:bg-primary-soft"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/resources" className={linkClass}>
              Resources
            </Link>
          </nav>
        )}
        {!isChoice && mode === "career" && (
          <nav className="hidden w-1/2 items-center justify-center gap-5 pr-12 md:flex lg:gap-8">
            <Link to="/jobs" className={linkClass}>
              Jobs
            </Link>
            <Link to="/jobs" search={{ kind: "internship" }} className={linkClass}>
              Internships
            </Link>
            <Link to="/jobs" search={{ kind: "graduate_program" }} className={linkClass}>
              Graduate programmes
            </Link>
          </nav>
        )}

        <Link
          to={home}
          className="absolute left-4 hidden translate-x-0 md:left-1/2 md:block md:-translate-x-1/2"
          aria-label="StartItUp home"
        >
          <span className="flex h-8 w-8 items-center justify-center bg-primary font-serif text-[15px] text-primary-foreground">
            S
          </span>
        </Link>

        <div
          className={
            "ml-auto flex items-center gap-2 md:gap-6 " +
            (isChoice ? "" : "md:ml-0 md:w-1/2 md:justify-center md:pl-12")
          }
        >
          {!isChoice && mode === "business" && (
            <>
              <Link to="/success-stories" className={`${linkClass} hidden md:inline`}>
                Stories
              </Link>
              <Link to="/submit" className={`${linkClass} hidden md:inline`}>
                Submit
              </Link>
            </>
          )}
          {!isChoice && switcher}
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
                <div className="absolute right-0 top-full z-50 mt-2 w-44 border border-border bg-background shadow-sm">
                  {[
                    ["Dashboard", "/dashboard"],
                    ["Profile", "/profile"],
                    ["Saved", "/saved"],
                    ["Sign out", "/logout"],
                  ].map(([label, to]) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setAvatarOpen(false)}
                      className="block px-4 py-2.5 text-[13.5px] text-foreground/75 hover:bg-primary-soft"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              search={{ redirect: undefined }}
              className="text-[13.5px] font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
