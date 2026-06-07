import { createFileRoute, redirect } from "@tanstack/react-router";
import { completeAuthCallback } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (s: Record<string, unknown>) => ({
    code: typeof s.code === "string" ? s.code : undefined,
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  loaderDeps: ({ search }) => ({ code: search.code, next: search.next }),
  loader: async ({ deps }) => {
    const code = deps.code;
    if (!code) throw redirect({ to: "/" });
    const result = await completeAuthCallback({ data: { code, next: deps.next } });
    throw redirect({
      to: result.destination,
      statusCode: 302,
      headers: result.cookieHeaders as HeadersInit,
    });
  },
  component: () => (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-[14px] text-muted-foreground">Signing you in…</p>
    </div>
  ),
});
