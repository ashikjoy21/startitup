import { Link } from "@tanstack/react-router";

const cols = [
  {
    title: "Discover",
    links: [
      ["Opportunities", "/opportunities"],
      ["Credit Calculator", "/calculator"],
      ["Saved", "/saved"],
    ],
  },
  {
    title: "Programs",
    links: [
      ["Startup Credits", "/opportunities"],
      ["Grants", "/opportunities"],
      ["Accelerators", "/accelerators"],
      ["Incubators", "/incubators"],
      ["Fellowships", "/opportunities"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/calculator"],
      ["Founder Dashboard", "/dashboard"],
      ["Profile", "/profile"],
      ["Contact", "/"],
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[#0E0E0E] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center bg-primary font-serif text-base">S</span>
              <span className="text-[15px] font-medium">StartItUp</span>
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] text-white/60">
              Every startup opportunity in India. One place.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-[13px] font-medium">{c.title}</div>
              <ul className="mt-4 space-y-3">
                {c.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to as any} className="text-[13.5px] text-white/65 hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 border-t border-white/10 pt-6 text-[12.5px] text-white/45">
          © {new Date().getFullYear()} StartItUp · Built for Indian founders.
        </div>
      </div>
    </footer>
  );
}
