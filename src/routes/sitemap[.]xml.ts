import { createFileRoute } from "@tanstack/react-router";
import { guides } from "@/lib/guides";
import { listOpportunities } from "@/lib/api/opportunities.functions";
import { listInvestors, listFundedStartups } from "@/lib/api/investors.functions";

const BASE = "https://startitup.in";

const STATIC_ROUTES = [
  { loc: BASE, priority: "1.0", changefreq: "daily" },
  { loc: `${BASE}/opportunities`, priority: "0.9", changefreq: "daily" },
  { loc: `${BASE}/investors`, priority: "0.8", changefreq: "weekly" },
  { loc: `${BASE}/startups`, priority: "0.8", changefreq: "weekly" },
  { loc: `${BASE}/funding`, priority: "0.7", changefreq: "weekly" },
  { loc: `${BASE}/accelerators`, priority: "0.7", changefreq: "monthly" },
  { loc: `${BASE}/incubators`, priority: "0.7", changefreq: "monthly" },
  { loc: `${BASE}/resources`, priority: "0.7", changefreq: "monthly" },
  { loc: `${BASE}/calculator`, priority: "0.5", changefreq: "monthly" },
];

function url(loc: string, priority: string, changefreq: string, lastmod?: string) {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split("T")[0];

        let opportunityUrls: string[] = [];
        let investorUrls: string[] = [];
        let startupUrls: string[] = [];

        try {
          const opps = await listOpportunities({ data: { limit: 5000, offset: 0 } });
          opportunityUrls = opps.items.map((o) =>
            url(`${BASE}/opportunities/${encodeURIComponent(o.id)}`, "0.6", "weekly", today),
          );
        } catch { /* ok */ }

        try {
          const invs = await listInvestors({ data: { limit: 5000, offset: 0 } });
          investorUrls = invs.items.map((i) =>
            url(`${BASE}/investors/${encodeURIComponent(i.id)}`, "0.5", "monthly"),
          );
        } catch { /* ok */ }

        try {
          const stups = await listFundedStartups({ data: { limit: 5000, offset: 0 } });
          startupUrls = stups.items.map((s) =>
            url(`${BASE}/startups/${encodeURIComponent(s.id)}`, "0.5", "monthly"),
          );
        } catch { /* ok */ }

        const guideUrls = guides.map((g) =>
          url(`${BASE}/resources/${g.slug}`, "0.6", "monthly"),
        );

        const staticUrls = STATIC_ROUTES.map((r) =>
          url(r.loc, r.priority, r.changefreq, today),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...staticUrls,
          ...guideUrls,
          ...opportunityUrls,
          ...investorUrls,
          ...startupUrls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
