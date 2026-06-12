import { createFileRoute } from "@tanstack/react-router";
import { StartupDirectoryPage } from "@/components/startup-directory";
import {
  getInvestorMeta,
  getStartupFilterOptions,
  listFundedStartups,
} from "@/lib/api/investors.functions";

export const Route = createFileRoute("/startups/")({
  head: () => ({
    meta: [
      { title: "Funded Startups in India — StartItUp.in" },
      {
        name: "description",
        content:
          "Browse funded Indian startups — sectors, funding rounds, and context from Inc42 and Entrackr.",
      },
      { property: "og:title", content: "Funded Startups in India — StartItUp.in" },
      { property: "og:description", content: "Browse funded Indian startups — sectors, funding rounds, and context from Inc42 and Entrackr." },
      { property: "og:url", content: "https://startitup.in/startups" },
    ],
    links: [{ rel: "canonical", href: "https://startitup.in/startups" }],
  }),
  loader: async () => {
    const [meta, options, list] = await Promise.all([
      getInvestorMeta(),
      getStartupFilterOptions(),
      listFundedStartups({ data: { limit: 5000, offset: 0 } }),
    ]);
    return {
      meta,
      sectors: options.sectors,
      items: list.items,
      total: list.total,
    };
  },
  component: StartupsIndexPage,
});

function StartupsIndexPage() {
  const { meta, sectors, items, total } = Route.useLoaderData();
  return (
    <StartupDirectoryPage
      items={items}
      total={total}
      sectors={sectors}
      builtAt={meta.built_at}
      sectorsVerifiedFunded={meta.counts.sectors_verified_funded}
    />
  );
}
