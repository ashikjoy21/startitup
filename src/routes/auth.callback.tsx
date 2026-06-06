import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { createSupabaseSSRClient, serializeCookie, getProfile } from "@/lib/auth.server";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  loaderDeps: ({ search }) => ({ next: search.next }),
  loader: async ({ deps }) => {
    const req = getRequest();
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      throw redirect({ to: "/" });
    }

    const { supabase, getPending } = createSupabaseSSRClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      throw redirect({ to: "/login", search: { redirect: undefined } });
    }

    const profile = await getProfile(data.user.id);
    const destination = profile ? (deps.next ?? "/dashboard") : "/onboarding";

    // Build Set-Cookie pairs — string[][] is valid HeadersInit and supports
    // multiple entries with the same header name.
    const cookieHeaders = getPending().map((c): [string, string] => [
      "Set-Cookie",
      serializeCookie(c.name, c.value, c.options),
    ]);

    throw redirect({
      to: destination,
      statusCode: 302,
      headers: cookieHeaders as HeadersInit,
    });
  },
  component: () => (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-[14px] text-muted-foreground">Signing you in…</p>
    </div>
  ),
});
