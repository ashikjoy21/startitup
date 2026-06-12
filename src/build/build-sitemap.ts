/**
 * Regenerates public/sitemap.xml (run locally via npm run sitemap:build).
 * CI uses the committed public/sitemap.xml — this script is not required at build time.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { buildSitemapXml } from "../lib/sitemap.ts";
import { guides } from "../lib/guides.ts";
import { seedOpportunities } from "../lib/opportunities.ts";

const root = process.cwd();
const out = join(root, "public", "sitemap.xml");
const bundlePath = join(root, "src", "data", "investor-ui-bundle.json");

function loadEnvFile() {
  try {
    const raw = readFileSync(join(root, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

async function loadOpportunityIds(): Promise<string[]> {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    try {
      const supabase = createClient(supabaseUrl, serviceKey);
      const { data, error } = await supabase
        .from("opportunities")
        .select("id")
        .eq("status", "published")
        .limit(5000);

      if (!error && data?.length) {
        return data.map((row) => row.id);
      }
    } catch {
      // fall through to seed data
    }
  }

  return seedOpportunities.map((o) => o.id);
}

function loadInvestorStartupIds(): { investorIds: string[]; startupIds: string[] } {
  if (!existsSync(bundlePath)) {
    if (existsSync(out)) {
      console.warn(`Missing ${bundlePath} — keeping existing investor/startup URLs in ${out}`);
      const xml = readFileSync(out, "utf8");
      const investorIds = [
        ...xml.matchAll(/<loc>https:\/\/startitup\.in\/investors\/([^<]+)<\/loc>/g),
      ].map((m) => decodeURIComponent(m[1]));
      const startupIds = [
        ...xml.matchAll(/<loc>https:\/\/startitup\.in\/startups\/([^<]+)<\/loc>/g),
      ].map((m) => decodeURIComponent(m[1]));
      return { investorIds, startupIds };
    }
    return { investorIds: [], startupIds: [] };
  }

  const bundle = JSON.parse(readFileSync(bundlePath, "utf8")) as {
    investors?: { id: string }[];
    funded_startups?: { id: string }[];
  };

  return {
    investorIds: (bundle.investors ?? []).map((i) => i.id),
    startupIds: (bundle.funded_startups ?? []).map((s) => s.id),
  };
}

async function main() {
  loadEnvFile();
  const { investorIds, startupIds } = loadInvestorStartupIds();

  const xml = buildSitemapXml({
    opportunityIds: await loadOpportunityIds(),
    investorIds,
    startupIds,
    guideSlugs: guides.map((g) => g.slug),
  });

  writeFileSync(out, xml, "utf8");

  const urlCount = (xml.match(/<url>/g) ?? []).length;
  console.log(`Wrote ${out} — ${urlCount} URLs`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
