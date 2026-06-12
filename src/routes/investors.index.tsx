import { createFileRoute } from "@tanstack/react-router";
import { InvestorDirectoryPage } from "@/components/investor-directory";
import {
  getInvestorFilterOptions,
  getInvestorMeta,
  listInvestors,
} from "@/lib/api/investors.functions";

export const Route = createFileRoute("/investors/")({
  head: () => ({
    meta: [
      { title: "Investors in India — StartItUp" },
      {
        name: "description",
        content:
          "Browse VCs, angels, and funds investing in Indian startups. Filter by stage, sector, and type.",
      },
    ],
  }),
  loader: async () => {
    const [meta, options, list] = await Promise.all([
      getInvestorMeta(),
      getInvestorFilterOptions(),
      listInvestors({ data: { limit: 5000, offset: 0 } }),
    ]);
    return {
      meta,
      types: options.types,
      stages: options.stages,
      items: list.items,
      total: list.total,
    };
  },
  component: InvestorsIndexPage,
});

function InvestorsIndexPage() {
  const { meta, types, stages, items, total } = Route.useLoaderData();
  return (
    <InvestorDirectoryPage
      items={items}
      total={total}
      types={types}
      stages={stages}
      builtAt={meta.built_at}
    />
  );
}
