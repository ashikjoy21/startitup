import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/saved")({
  loader: () => {
    throw redirect({ to: "/dashboard", search: { tab: "saved" } });
  },
});
