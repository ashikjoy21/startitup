import { createFileRoute, redirect } from "@tanstack/react-router";
import { createSupabaseSSRClient, serializeCookie } from "@/lib/auth.server";

export const Route = createFileRoute("/logout")({
  loader: async () => {
    const { supabase, getPending } = createSupabaseSSRClient();
    await supabase.auth.signOut();

    const cookieHeaders = getPending().map((c): [string, string] => [
      "Set-Cookie",
      serializeCookie(c.name, c.value, c.options),
    ]);

    throw redirect({
      to: "/",
      statusCode: 302,
      headers: cookieHeaders as HeadersInit,
    });
  },
  component: () => null,
});
