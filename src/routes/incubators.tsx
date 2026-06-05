import { createFileRoute } from "@tanstack/react-router";
import { MeityDirectoryPage } from "@/components/meity-directory";
import { meityIncubators, MEITY_INCUBATOR_URL } from "@/lib/meity";

export const Route = createFileRoute("/incubators")({
  head: () => ({
    meta: [
      { title: "Incubators in India — StartItUp.in" },
      {
        name: "description",
        content:
          "Browse 517 incubators registered on MeitY Startup Hub. Filter by state and domain to find the right fit for your startup.",
      },
    ],
  }),
  loader: () => meityIncubators,
  component: IncubatorsPage,
});

function IncubatorsPage() {
  const items = Route.useLoaderData();
  return (
    <MeityDirectoryPage
      title="Incubators in India"
      subtitle="Government-registered incubators supporting early-stage startups across India. Browse by state or domain to find the right fit."
      items={items}
      meityUrl={MEITY_INCUBATOR_URL}
    />
  );
}
