import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — StartItUp" },
      {
        name: "description",
        content: "How StartItUp collects, uses, and protects your information.",
      },
    ],
  }),
  component: PrivacyPage,
});

const CONTACT = "hello@startitup.in";

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="12 June 2026">
      <p>
        StartItUp (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates a directory of
        startup opportunities, funding, investors, and related resources for founders in India. This
        policy explains what personal data we collect, why, and how we protect it.
      </p>
      <p className="rounded border border-border bg-muted/40 px-4 py-3 text-[13.5px] text-muted-foreground">
        This policy is written to be readable, not to obscure anything. If you need formal advice on
        data protection compliance, consult a lawyer familiar with Indian law (DPDPA 2023) and any
        laws applicable to your jurisdiction.
      </p>

      <LegalSection title="1. Who this applies to">
        <p>
          This policy applies to anyone who visits or uses StartItUp (the &quot;Service&quot;),
          including visitors browsing anonymously and registered users. The Service is intended for
          users who are <strong>18 years of age or older</strong>. We do not knowingly collect
          personal data from anyone under 18; if you believe a minor has registered, contact us and
          we will delete the account.
        </p>
      </LegalSection>

      <LegalSection title="2. Information you provide">
        <p>
          When you create an account via Google Sign-In, we receive from Google only your email
          address, display name, and profile picture — nothing else. We use these to create and
          identify your account.
        </p>
        <p>
          You may also save opportunities, set onboarding preferences, and generate MCP API keys in
          your profile. API keys are stored in hashed form. We do not store your Google password or
          full OAuth tokens beyond what our auth provider (Supabase) needs to maintain your session.
        </p>
        <p>
          If you submit an opportunity or correction through the site, we store that submission and
          your account identifier so we can contact you if needed and attribute the contribution.
        </p>
      </LegalSection>

      <LegalSection title="3. Information we collect automatically">
        <p>
          When you use the Service, our infrastructure (Cloudflare) and analytics provider (Google
          Analytics) collect standard web analytics data, including:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Pages visited, time on site, and navigation paths.</li>
          <li>Referring URL and approximate geographic region (country/city level).</li>
          <li>Browser type, operating system, and device category.</li>
          <li>IP address (used for geolocation and security; not stored long-term by us).</li>
        </ul>
        <p>
          We use <strong>Google Analytics 4</strong> (property ID: G-MDNW9YKFDL) to understand how
          the product is used in aggregate. Google Analytics sets cookies in your browser (see
          Section 6). You can opt out at{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            tools.google.com/dlpage/gaoptout
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Information we display (not collected from you)">
        <p>
          Much of what you see on StartItUp is{" "}
          <strong>aggregated public information</strong> — government scheme listings, incubator
          directories, funding round summaries, investor profiles, and similar facts gathered from
          publicly accessible websites and official sources.
        </p>
        <p>
          We aim to link each listing to its original source where possible. We do not claim
          ownership of third-party content; we organize and present factual summaries to help
          founders discover opportunities.
        </p>
      </LegalSection>

      <LegalSection title="5. How we use your information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Authenticate you and personalize your experience (saved items, dashboard, profile).</li>
          <li>Operate the MCP API when you use an API key you created.</li>
          <li>Understand aggregate usage patterns so we can improve the product.</li>
          <li>Fix errors and respond to correction or takedown requests.</li>
          <li>
            Send newsletters or product updates — <strong>only if you explicitly opt in</strong>. We
            do not send marketing email to accounts that have not opted in.
          </li>
        </ul>
        <p>
          <strong>We do not sell your personal information.</strong> We do not use your data for
          advertising targeting or share it with data brokers.
        </p>
        <p>
          Our use of information received from Google Sign-In complies with the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. We access only the minimum Google account data
          needed to authenticate you; we do not use it for any purpose unrelated to providing the
          Service.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies and local storage">
        <p>We use the following types of browser storage:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Strictly necessary cookies</strong> — session authentication cookies set by
            Supabase. Required for sign-in to work; cannot be disabled without breaking the Service.
          </li>
          <li>
            <strong>Analytics cookies</strong> — set by Google Analytics (GA4) to identify unique
            visitors and sessions in aggregate. These are not advertising cookies but do involve a
            third-party service. You can opt out via the Google Analytics opt-out browser add-on.
          </li>
          <li>
            <strong>Local storage</strong> — used to persist your filter preferences and UI state
            across sessions. This data never leaves your browser.
          </li>
        </ul>
        <p>We do not use advertising, retargeting, or social-media tracking cookies.</p>
      </LegalSection>

      <LegalSection title="7. Third-party service providers">
        <p>
          We share data with the following sub-processors only to the extent needed to operate the
          Service:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> (United States) — authentication, user database, and API key
            storage. Supabase processes personal data under its{" "}
            <a
              href="https://supabase.com/privacy"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Google</strong> (United States) — OAuth sign-in and Google Analytics. Subject to{" "}
            <a
              href="https://policies.google.com/privacy"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google&apos;s privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Cloudflare</strong> (United States) — application hosting, CDN, and edge
            delivery. Cloudflare may process request metadata (IP, headers) in transit.
          </li>
        </ul>
        <p>
          Each provider operates in the United States or internationally. By using the Service, you
          acknowledge that your data may be transferred to and processed in countries outside India.
          We take reasonable steps to ensure these providers maintain adequate data protection
          practices.
        </p>
      </LegalSection>

      <LegalSection title="8. Data retention">
        <p>
          Account data (email, display name, saved items, API keys) is retained while your account
          is active. You may delete saved items at any time from your profile, or request full
          account deletion by emailing{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>
          . We will complete deletion within 30 days.
        </p>
        <p>
          Aggregated public directory listings (grants, investors, funding rounds) may remain on the
          site after account deletion because they are not personal data about you.
        </p>
        <p>Analytics data is retained subject to Google Analytics&apos; default retention settings.</p>
      </LegalSection>

      <LegalSection title="9. Your rights (DPDPA and general)">
        <p>
          Under India&apos;s Digital Personal Data Protection Act 2023 (DPDPA) and applicable law,
          you have the right to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Know what personal data we hold about you.</li>
          <li>Correct inaccurate personal data.</li>
          <li>Request deletion of your personal data (subject to legal retention obligations).</li>
          <li>Withdraw consent for processing where consent is the legal basis.</li>
          <li>Nominate a person to exercise these rights on your behalf.</li>
        </ul>
        <p>
          To exercise any of these rights, contact our Grievance Officer at{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>
          . We will respond within 30 days. If your concern is not resolved, you may approach the
          Data Protection Board of India once it is constituted under the DPDPA.
        </p>
      </LegalSection>

      <LegalSection title="10. Third-party content and corrections">
        <p>
          If you are a rights holder and believe we have displayed information about you or your
          organization incorrectly or in a way you object to, please contact us. We review
          correction and removal requests promptly. See our{" "}
          <a href="/terms#data-sources" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          for more on data sources and takedowns.
        </p>
      </LegalSection>

      <LegalSection title="11. Security">
        <p>
          We use industry-standard security practices: HTTPS, hashed storage for API keys,
          role-based access controls in our database, and access limited to what each service
          provider needs. No system is perfectly secure; in the event of a data breach that affects
          your personal data, we will notify you as required by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to this policy">
        <p>
          We may update this policy as the product evolves. Material changes — such as new data
          uses, new third-party processors, or changes affecting your rights — will be reflected in
          the &quot;Last updated&quot; date above. Continued use of the Service after a material
          change constitutes acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact / Grievance Officer">
        <p>
          Privacy questions, data requests, or complaints:{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
