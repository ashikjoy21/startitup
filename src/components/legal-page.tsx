import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-[720px] px-6 py-16 md:py-20">
        <p className="text-[13px] text-muted-foreground">Legal</p>
        <h1 className="mt-2 font-serif text-[40px] leading-tight md:text-[48px]">{title}</h1>
        <p className="mt-3 text-[13.5px] text-muted-foreground">Last updated: {updated}</p>
        <div className="prose-legal mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
          {children}
        </div>
        <p className="mt-12 border-t border-border pt-8 text-[13.5px] text-muted-foreground">
          See also{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>{" "}
          ·{" "}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
        </p>
      </article>
    </SiteLayout>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-[22px] text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
