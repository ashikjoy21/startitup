import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { InvestorDetailPage } from "@/components/investor-detail";
import { getInvestorById } from "@/lib/api/investors.functions";

export const Route = createFileRoute("/investors/$id")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.investor
          ? `${loaderData.investor.name} — Investors — StartItUp`
          : "Investor — StartItUp",
      },
      {
        name: "description",
        content: loaderData?.investor
          ? `${loaderData.investor.name} portfolio, investment focus, and funding activity in India.`
          : "Investor profile on StartItUp",
      },
    ],
  }),
  loader: async ({ params }) => {
    const { investor } = await getInvestorById({ data: { id: params.id } });
    return { investor };
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Investor not found</h1>
        <p className="mt-3 text-[14px] text-muted-foreground">{error.message}</p>
        <Link to="/investors" className="mt-6 inline-block text-primary hover:underline">
          ← All investors
        </Link>
      </div>
    </SiteLayout>
  ),
  component: InvestorDetailRoute,
});

function InvestorDetailRoute() {
  const { investor } = Route.useLoaderData();
  return <InvestorDetailPage investor={investor} />;
}
