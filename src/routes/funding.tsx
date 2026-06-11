import { createFileRoute } from "@tanstack/react-router";
import { FundingDirectoryPage } from "@/components/funding-directory";
import {
  getInvestorFilterOptions,
  getInvestorMeta,
  listFundingRounds,
} from "@/lib/api/investors.functions";

export const Route = createFileRoute("/funding")({
  head: () => ({
    meta: [
      { title: "Startup Funding Rounds — StartItUp.in" },
      {
        name: "description",
        content:
          "Track Indian startup funding rounds — amounts, investors, and sources from Inc42 and Entrackr.",
      },
    ],
  }),
  loader: async () => {
    const [meta, options, list] = await Promise.all([
      getInvestorMeta(),
      getInvestorFilterOptions(),
      listFundingRounds({ data: { limit: 5000, offset: 0 } }),
    ]);
    return {
      meta,
      roundTypes: options.roundTypes,
      items: list.items,
      total: list.total,
    };
  },
  component: FundingPage,
});

function FundingPage() {
  const { meta, roundTypes, items, total } = Route.useLoaderData();
  return (
    <FundingDirectoryPage
      items={items}
      total={total}
      roundTypes={roundTypes}
      builtAt={meta.built_at}
      sectorsVerified={meta.counts.sectors_verified}
      sectorsVerifiedFunded={meta.counts.sectors_verified_funded}
    />
  );
}
