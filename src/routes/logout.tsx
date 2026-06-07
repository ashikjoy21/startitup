import { createFileRoute, redirect } from "@tanstack/react-router";
import { completeLogout } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/logout")({
  loader: async () => {
    const { cookieHeaders } = await completeLogout();
    throw redirect({ to: "/", statusCode: 302, headers: cookieHeaders as HeadersInit });
  },
  component: () => null,
});
