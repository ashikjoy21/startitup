import { createFileRoute, redirect } from "@tanstack/react-router";
import { createSupabaseSSRClient, serializeCookie, getProfile } from "@/lib/auth.server";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (s: Record<string, unknown>) => ({
    code: typeof s.code === "string" ? s.code : undefined,
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  loaderDeps: ({ search }) => ({ code: search.code, next: search.next }),
  loader: async ({ deps }) => {
    const code = deps.code ?? null;

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
