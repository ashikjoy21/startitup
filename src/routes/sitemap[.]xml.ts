import { createFileRoute } from "@tanstack/react-router";
import { guides } from "@/lib/guides";
import { listOpportunities } from "@/lib/api/opportunities.functions";
import { listInvestors, listFundedStartups } from "@/lib/api/investors.functions";
import { buildSitemapXml, sitemapResponse } from "@/lib/sitemap";

async function generateSitemap() {
  let opportunityIds: string[] = [];
  let investorIds: string[] = [];
  let startupIds: string[] = [];

  try {
    const opps = await listOpportunities({ data: { limit: 5000, offset: 0 } });
    opportunityIds = opps.items.map((o) => o.id);
  } catch {
    /* ok */
  }

  try {
    const invs = await listInvestors({ data: { limit: 5000, offset: 0 } });
    investorIds = invs.items.map((i) => i.id);
  } catch {
    /* ok */
  }

  try {
    const startups = await listFundedStartups({ data: { limit: 5000, offset: 0 } });
    startupIds = startups.items.map((s) => s.id);
  } catch {
    /* ok */
  }

  return buildSitemapXml({
    opportunityIds,
    investorIds,
    startupIds,
    guideSlugs: guides.map((g) => g.slug),
  });
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => sitemapResponse(await generateSitemap()),
      HEAD: async () => {
        const xml = await generateSitemap();
        return new Response(null, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
            "content-length": String(Buffer.byteLength(xml, "utf8")),
          },
        });
      },
    },
  },
});
