export const SITEMAP_BASE = "https://startitup.in";

const STATIC_ROUTES = [
  { loc: SITEMAP_BASE, priority: "1.0", changefreq: "daily" },
  { loc: `${SITEMAP_BASE}/opportunities`, priority: "0.9", changefreq: "daily" },
  { loc: `${SITEMAP_BASE}/investors`, priority: "0.8", changefreq: "weekly" },
  { loc: `${SITEMAP_BASE}/startups`, priority: "0.8", changefreq: "weekly" },
  { loc: `${SITEMAP_BASE}/funding`, priority: "0.7", changefreq: "weekly" },
  { loc: `${SITEMAP_BASE}/accelerators`, priority: "0.7", changefreq: "monthly" },
  { loc: `${SITEMAP_BASE}/incubators`, priority: "0.7", changefreq: "monthly" },
  { loc: `${SITEMAP_BASE}/resources`, priority: "0.7", changefreq: "monthly" },
  { loc: `${SITEMAP_BASE}/calculator`, priority: "0.5", changefreq: "monthly" },
  { loc: `${SITEMAP_BASE}/privacy`, priority: "0.3", changefreq: "yearly" },
  { loc: `${SITEMAP_BASE}/terms`, priority: "0.3", changefreq: "yearly" },
] as const;

export type SitemapInput = {
  opportunityIds: string[];
  investorIds: string[];
  startupIds: string[];
  guideSlugs: string[];
  lastmod?: string;
};

function urlEntry(
  loc: string,
  priority: string,
  changefreq: string,
  lastmod?: string,
): string {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildSitemapXml(input: SitemapInput): string {
  const lastmod = input.lastmod ?? new Date().toISOString().split("T")[0];

  const staticUrls = STATIC_ROUTES.map((route) =>
    urlEntry(route.loc, route.priority, route.changefreq, lastmod),
  );

  const guideUrls = input.guideSlugs.map((slug) =>
    urlEntry(`${SITEMAP_BASE}/resources/${encodeURIComponent(slug)}`, "0.6", "monthly"),
  );

  const opportunityUrls = input.opportunityIds.map((id) =>
    urlEntry(
      `${SITEMAP_BASE}/opportunities/${encodeURIComponent(id)}`,
      "0.6",
      "weekly",
      lastmod,
    ),
  );

  const investorUrls = input.investorIds.map((id) =>
    urlEntry(`${SITEMAP_BASE}/investors/${encodeURIComponent(id)}`, "0.5", "monthly"),
  );

  const startupUrls = input.startupIds.map((id) =>
    urlEntry(`${SITEMAP_BASE}/startups/${encodeURIComponent(id)}`, "0.5", "monthly"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...staticUrls,
    ...guideUrls,
    ...opportunityUrls,
    ...investorUrls,
    ...startupUrls,
    `</urlset>`,
  ].join("\n");
}

export function sitemapResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
