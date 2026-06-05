import { useState, useMemo } from "react";
import { SiteLayout } from "@/components/site-layout";
import type { MeityOrg } from "@/lib/meity";

const INITIAL_COUNT = 24;

function normalizeState(s: string): string {
  const t = s.trim();
  const l = t.toLowerCase();
  if (l === "jammu and kashmir" || l === "jammu & kashmir") return "Jammu & Kashmir";
  if (l === "nct of delhi") return "Delhi";
  return t;
}

export function MeityDirectoryPage({
  title,
  subtitle,
  items,
  meityUrl,
}: {
  title: string;
  subtitle: string;
  items: MeityOrg[];
  meityUrl: string;
}) {
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");
  const [domain, setDomain] = useState("All");
  const [count, setCount] = useState(INITIAL_COUNT);

  const states = useMemo(() => {
    const set = new Set(
      items.map((r) => (r.state ? normalizeState(r.state) : "")).filter(Boolean)
    );
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const domains = useMemo(() => {
    const set = new Set(items.flatMap((r) => r.domains));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((org) => {
      if (q && !org.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (state !== "All" && normalizeState(org.state) !== state) return false;
      if (domain !== "All" && !org.domains.includes(domain)) return false;
      return true;
    });
  }, [items, q, state, domain]);

  const visible = filtered.slice(0, count);
  const remaining = filtered.length - count;

  function resetCount() {
    setCount(INITIAL_COUNT);
  }

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="text-[13px] text-muted-foreground">Directory</div>
          <h1 className="mt-2 font-serif text-[48px] leading-tight md:text-[60px]">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-foreground/75">{subtitle}</p>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Data from{" "}
            <a
              href={meityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              MeitY Startup Hub
            </a>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-8">
            <div>
              <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Search
              </div>
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  resetCount();
                }}
                placeholder="Search by name…"
                className="h-10 w-full border border-border bg-card px-3 text-[13.5px] outline-none focus:border-primary"
              />
            </div>
            <DirFilterGroup
              label="State"
              value={state}
              setValue={(v) => {
                setState(v);
                resetCount();
              }}
              options={states}
            />
            <DirFilterGroup
              label="Domain"
              value={domain}
              setValue={(v) => {
                setDomain(v);
                resetCount();
              }}
              options={domains}
              scrollable
            />
          </aside>

          <div>
            <div className="mb-4 text-[13px] text-muted-foreground">
              {filtered.length} of {items.length} results
            </div>

            {filtered.length === 0 ? (
              <div className="border border-border bg-card p-10 text-center text-[14px] text-muted-foreground">
                No results match your filters.
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((org) => (
                    <DirectoryCard key={org.id} org={org} meityUrl={meityUrl} />
                  ))}
                </div>
                {remaining > 0 && (
                  <button
                    onClick={() => setCount((c) => c + INITIAL_COUNT)}
                    className="mt-6 w-full border border-border bg-card py-3 text-[13.5px] text-foreground/80 hover:bg-muted"
                  >
                    Show {Math.min(INITIAL_COUNT, remaining)} more ({remaining} remaining)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function DirectoryCard({
  org,
  meityUrl,
}: {
  org: MeityOrg;
  meityUrl: string;
}) {
  const location = [org.city, org.state ? normalizeState(org.state) : ""]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-3 border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <DirectoryLogo name={org.name} logoUrl={org.logoUrl} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-medium text-foreground">
            {org.name}
          </div>
          {location && (
            <div className="mt-0.5 text-[12px] text-muted-foreground">{location}</div>
          )}
        </div>
      </div>

      {org.domains.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {org.domains.slice(0, 3).map((d, i) => (
            <span
              key={i}
              className="border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {d}
            </span>
          ))}
          {org.domains.length > 3 && (
            <span className="px-1 py-0.5 text-[11px] text-muted-foreground">
              +{org.domains.length - 3} more
            </span>
          )}
        </div>
      )}

      <a
        href={meityUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto text-[12.5px] text-primary hover:underline"
      >
        Browse on MeitY →
      </a>
    </div>
  );
}

function DirectoryLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  const size = 40;
  const base =
    "flex shrink-0 items-center justify-center border border-border bg-primary-soft overflow-hidden";

  if (logoUrl) {
    return (
      <div className={base} style={{ width: size, height: size, minWidth: size }}>
        <img src={logoUrl} alt={name} className="h-full w-full object-contain p-1" />
      </div>
    );
  }
  return (
    <div
      className={`${base} font-serif text-primary`}
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.45 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function DirFilterGroup({
  label,
  value,
  setValue,
  options,
  scrollable = false,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
  scrollable?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul className={`space-y-1.5 ${scrollable ? "max-h-64 overflow-y-auto pr-1" : ""}`}>
        {options.map((o) => (
          <li key={o}>
            <button
              onClick={() => setValue(o)}
              className={
                "text-[13.5px] " +
                (value === o
                  ? "text-primary underline underline-offset-2"
                  : "text-foreground/80 hover:text-primary")
              }
            >
              {o}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
