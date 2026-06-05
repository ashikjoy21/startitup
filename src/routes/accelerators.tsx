import { createFileRoute } from "@tanstack/react-router";
import { MeityDirectoryPage } from "@/components/meity-directory";
import { meityAccelerators, MEITY_ACCELERATOR_URL } from "@/lib/meity";

export const Route = createFileRoute("/accelerators")({
  head: () => ({
    meta: [
      { title: "Accelerators in India — StartItUp.in" },
      {
        name: "description",
        content:
          "Browse 36 accelerators registered on MeitY Startup Hub. Filter by state and domain to find the right program for your startup.",
      },
    ],
  }),
  loader: () => meityAccelerators,
  component: AcceleratorsPage,
});

function AcceleratorsPage() {
  const items = Route.useLoaderData();
  return (
    <MeityDirectoryPage
      title="Accelerators in India"
      subtitle="Government-registered accelerators helping startups grow faster. Browse by state or domain to find the right program."
      items={items}
      meityUrl={MEITY_ACCELERATOR_URL}
    />
  );
}
