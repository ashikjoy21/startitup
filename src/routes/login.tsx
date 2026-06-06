import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { getSupabaseBrowser } from "@/lib/supabase.client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — StartItUp.in" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();

  async function handleGoogleLogin() {
    const supabase = getSupabaseBrowser();
    const origin = window.location.origin;
    const next = redirect ? `?next=${encodeURIComponent(redirect)}` : "";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback${next}`,
        queryParams: { prompt: "select_account" },
      },
    });
  }

  return (
    <SiteLayout>
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm border border-border bg-card p-10">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center bg-primary font-serif text-[18px] text-primary-foreground">
              S
            </div>
            <h1 className="mt-6 font-serif text-[28px] leading-tight">Welcome back</h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Sign in to save opportunities and get personalised recommendations.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="mt-8 flex w-full items-center justify-center gap-3 border border-border bg-background px-4 py-3 text-[14px] font-medium hover:bg-muted"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-[12px] text-muted-foreground">
            No password needed. Your Google account is used for identity only.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
