import { createFileRoute } from "@tanstack/react-router";
import { getJobFacets, listIndexableJobIds } from "@/lib/api/jobs.functions";
import { jobUrl } from "@/lib/job-posting";
import { ROLE_FAMILIES, toSlug } from "@/lib/jobs-search";
import { SITEMAP_BASE, sitemapResponse } from "@/lib/sitemap";

// Every indexable job page plus the city and role landing pages. Under the 50,000-URL sitemap limit.
async function generate(): Promise<string> {
  const [jobs, facets] = await Promise.all([listIndexableJobIds(), getJobFacets()]);
  const entry = (loc: string, lastmod?: string) =>
    `  <url><loc>${loc.replaceAll("&", "&amp;")}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}</url>`;
  const landing = [
    ...facets.cities.map((c) => entry(`${SITEMAP_BASE}/jobs/city/${toSlug(c.name)}`)),
    ...ROLE_FAMILIES.filter((r) => r !== "Other").map((r) =>
      entry(`${SITEMAP_BASE}/jobs/role/${toSlug(r)}`),
    ),
  ];
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...landing,
    ...jobs.map((j) => entry(jobUrl(j.id), j.updatedAt)),
    `</urlset>`,
  ].join("\n");
}

export const Route = createFileRoute("/sitemap-jobs.xml")({
  server: { handlers: { GET: async () => sitemapResponse(await generate()) } },
});
