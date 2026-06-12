import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { StartupDetailPage } from "@/components/startup-detail";
import { getStartupById } from "@/lib/api/investors.functions";

export const Route = createFileRoute("/startups/$id")({
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title: loaderData?.startup
          ? `${loaderData.startup.name} — StartItUp.in`
          : "Startup — StartItUp.in",
      },
      {
        name: "description",
        content: loaderData?.startup
          ? `${loaderData.startup.name} funding history, investors, and sector on StartItUp.in.`
          : "Startup profile on StartItUp.in",
      },
      {
        property: "og:title",
        content: loaderData?.startup
          ? `${loaderData.startup.name} — StartItUp.in`
          : "Startup — StartItUp.in",
      },
      {
        property: "og:description",
        content: loaderData?.startup
          ? `${loaderData.startup.name} funding history, investors, and sector on StartItUp.in.`
          : "Startup profile on StartItUp.in",
      },
      { property: "og:url", content: `https://startitup.in/startups/${params.id}` },
    ],
    links: [{ rel: "canonical", href: `https://startitup.in/startups/${params.id}` }],
  }),
  loader: async ({ params }) => {
    const { startup } = await getStartupById({ data: { id: params.id } });
    return { startup };
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Startup not found</h1>
        <p className="mt-3 text-[14px] text-muted-foreground">{error.message}</p>
        <Link to="/startups" className="mt-6 inline-block text-primary hover:underline">
          ← All funded startups
        </Link>
      </div>
    </SiteLayout>
  ),
  component: StartupDetailRoute,
});

function StartupDetailRoute() {
  const { startup } = Route.useLoaderData();
  return <StartupDetailPage startup={startup} />;
}
