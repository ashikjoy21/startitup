import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/legal-page";

const CONTACT = "hello@startitup.in";

export const Route = createFileRoute("/bot")({
  head: () => ({
    meta: [
      { title: "StartItUpBot — StartItUp" },
      {
        name: "description",
        content: "What StartItUpBot crawls, how it behaves, and how to opt out.",
      },
    ],
  }),
  component: BotPage,
});

function BotPage() {
  return (
    <LegalPage title="StartItUpBot" updated="13 October 2026">
      <p>
        StartItUpBot helps students in India discover internships, graduate roles and programmes. It reads
        public job listings and links students to the employer&apos;s own application page.
      </p>
      <LegalSection title="What it reads">
        <p>
          Public careers pages and the public job-board feeds behind them (for example Greenhouse, Lever,
          Ashby, SmartRecruiters and Workday), schema.org JobPosting data, and official programme or
          recruitment pages. It does not log in, submit forms or apply on anyone&apos;s behalf.
        </p>
      </LegalSection>
      <LegalSection title="How it behaves">
        <p>
          It identifies itself as <code>StartItUpBot/1.0 (+https://startitup.in/bot)</code>. It follows
          robots.txt on company websites and careers pages, spaces out its page requests to each site
          (about one per second), backs off when asked to slow down, and does not attempt to bypass bot
          protection or logins. Public job-board APIs that employers publish for distribution are read
          directly.
        </p>
      </LegalSection>
      <LegalSection title="Opting out or correcting a listing">
        <p>
          Disallow <code>StartItUpBot</code> in your robots.txt, or email{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and we will stop crawling your site and remove its
          listings, or correct anything that is wrong.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
