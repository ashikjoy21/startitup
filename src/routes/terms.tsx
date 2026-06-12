import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — StartItUp.in" },
      {
        name: "description",
        content: "Terms governing use of StartItUp.in and its API.",
      },
    ],
  }),
  component: TermsPage,
});

const CONTACT = "hello@startitup.in";

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="12 June 2026">
      <p>
        By accessing or using StartItUp.in (the &quot;Service&quot;), you agree to these Terms of
        Service (&quot;Terms&quot;). If you do not agree, do not use the Service.
      </p>
      <p className="rounded border border-border bg-muted/40 px-4 py-3 text-[13.5px] text-muted-foreground">
        These Terms describe how we operate the Service and what you can and cannot do with it. They
        are not legal advice.
      </p>

      <LegalSection title="1. Eligibility">
        <p>
          The Service is intended for users who are <strong>18 years of age or older</strong>. By
          using the Service you represent that you are at least 18 years old and have the legal
          capacity to enter into a binding agreement. If you are using the Service on behalf of an
          organization, you represent that you are authorized to bind that organization to these
          Terms.
        </p>
      </LegalSection>

      <LegalSection title="2. What we provide">
        <p>
          StartItUp.in is an <strong>information directory and discovery tool</strong> for Indian
          startup founders. We aggregate listings of grants, credits, accelerators, incubators,
          funding rounds, investors, and related resources.
        </p>
        <p>
          We are <strong>not</strong> a broker, investment adviser, or government agency. Nothing on
          this site constitutes investment, legal, tax, or financial advice. Always verify
          eligibility, deadlines, and terms on official program pages before applying or raising
          capital.
        </p>
      </LegalSection>

      <LegalSection title="3. Data sources and attribution">
        <div id="data-sources" />
        <p>Our content comes from several categories of sources:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Official and public sources</strong> — government portals (e.g. Startup India,
            MeitY incubator listings), program websites, and publicly published scheme documents.
          </li>
          <li>
            <strong>Editorial and news sources</strong> — publicly reported funding announcements
            and industry coverage. We extract factual metadata (company, round size where reported,
            date, participants) and link to the original article where available. We do not
            republish full articles or paywalled text.
          </li>
          <li>
            <strong>Public company and investor pages</strong> — portfolio lists, team pages, and
            other information voluntarily published by organizations on their own websites.
          </li>
          <li>
            <strong>User and community submissions</strong> — opportunities or corrections submitted
            through the site, subject to review.
          </li>
        </ul>
        <p>
          We strive for accuracy but <strong>data may be incomplete, outdated, or incorrect</strong>.
          Funding amounts, investor names, and program details should be confirmed with primary
          sources.
        </p>
      </LegalSection>

      <LegalSection title="4. Automated collection">
        <p>
          To keep the directory useful, we use automated processes (including web crawling and
          structured extraction) to gather publicly available information from the sources above.
          Some third-party sites restrict or discourage automated access in their terms of use; we
          acknowledge that collection practices across the web exist in a legal grey area in many
          jurisdictions.
        </p>
        <p>Our approach is conservative:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>We collect factual metadata, not full copyrighted prose.</li>
          <li>We attribute and link to original sources where possible.</li>
          <li>We respect robots.txt and cease collection from a domain when asked.</li>
          <li>We respond to correction and takedown requests from rights holders.</li>
        </ul>
        <p>
          If you operate a source site and want us to stop indexing, limit use, or correct data,
          contact{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>{" "}
          with the URL and your request. We will review in good faith.
        </p>
      </LegalSection>

      <LegalSection title="5. Accounts">
        <p>
          You must provide accurate information when signing up. You are responsible for all
          activity under your account and for keeping credentials and API keys confidential. Notify
          us immediately at{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>{" "}
          if you suspect unauthorized access.
        </p>
        <p>
          You may not create accounts on behalf of others without their permission or operate
          multiple accounts to circumvent limits or suspensions.
        </p>
      </LegalSection>

      <LegalSection title="6. User submissions">
        <p>
          When you submit an opportunity, correction, or other content through the Service, you
          grant us a non-exclusive, royalty-free, worldwide license to display, distribute, and use
          that submission in connection with operating and improving the Service. You represent that
          you have the right to make the submission and that it does not violate any third-party
          rights.
        </p>
        <p>
          We may review, edit, or decline to publish any submission at our discretion, and may
          remove submissions that are inaccurate, inappropriate, or the subject of a valid takedown
          request.
        </p>
      </LegalSection>

      <LegalSection title="7. MCP API access">
        <p>
          Authenticated users may create API keys to access our MCP (Model Context Protocol)
          endpoint. API access is provided for personal or internal productivity use in connection
          with the Service.
        </p>
        <p>You may not:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Resell, sublicense, or distribute our dataset as a standalone competing product.</li>
          <li>Scrape the Service in ways that bypass rate limits, authentication, or access controls.</li>
          <li>Use the API to spam, harass, or violate applicable law.</li>
          <li>
            Misrepresent StartItUp.in data as official government communication, investment
            endorsement, or financial advice.
          </li>
          <li>Use the API for any purpose that violates these Terms or our Privacy Policy.</li>
        </ul>
        <p>
          We may revoke API keys or suspend access at any time for abuse, violation of these Terms,
          or operational reasons, with or without prior notice.
        </p>
      </LegalSection>

      <LegalSection title="8. Acceptable use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Violate any applicable local, national, or international law or regulation.</li>
          <li>Infringe intellectual property rights of any person or entity.</li>
          <li>Transmit malware, viruses, or other harmful code.</li>
          <li>
            Attempt to gain unauthorized access to our systems, servers, or any third-party
            accounts.
          </li>
          <li>
            Interfere with or disrupt the integrity or performance of the Service or its
            infrastructure.
          </li>
          <li>
            Harvest or collect personal information about other users without their consent.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p>
          The StartItUp.in name, brand, site design, and original editorial content are owned by or
          licensed to us. Third-party names, logos, and trademarks belong to their respective owners
          and are used for identification purposes only. Mere appearance on this site does not imply
          endorsement by or affiliation with StartItUp.in.
        </p>
        <p>
          If you believe content on the Service infringes your intellectual property rights, contact
          us at{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>{" "}
          with sufficient detail to locate the material and a description of the alleged
          infringement.
        </p>
      </LegalSection>

      <LegalSection title="10. Disclaimers">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF ACCURACY,
          COMPLETENESS, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT GUARANTEE
          THAT ANY OPPORTUNITY, GRANT, OR INVESTOR LISTING IS CURRENT, AVAILABLE, ACCURATE, OR
          SUITABLE FOR YOU.
        </p>
        <p>
          INFORMATION ON THIS SITE IS FOR GENERAL INFORMATIONAL PURPOSES ONLY AND DOES NOT
          CONSTITUTE INVESTMENT, LEGAL, TAX, OR FINANCIAL ADVICE. ALWAYS VERIFY WITH OFFICIAL
          SOURCES BEFORE ACTING ON ANY INFORMATION FOUND HERE.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, STARTITUP.IN AND ITS OPERATORS WILL
          NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
          INCLUDING ANY LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITY, ARISING FROM YOUR
          USE OF OR INABILITY TO USE THE SERVICE OR RELIANCE ON ITS CONTENT, EVEN IF WE HAVE BEEN
          ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR
          THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE 12 MONTHS
          BEFORE THE CLAIM AROSE OR (B) INR 1,000.
        </p>
      </LegalSection>

      <LegalSection title="12. Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless StartItUp.in and its operators,
          employees, and agents from and against any claims, liabilities, damages, losses, and
          expenses (including reasonable legal fees) arising out of or related to: (a) your use of
          the Service in violation of these Terms; (b) your submission of content that infringes
          third-party rights; or (c) your violation of any applicable law.
        </p>
      </LegalSection>

      <LegalSection title="13. Termination">
        <p>
          We may suspend or terminate your access to the Service at any time, with or without cause
          and with or without notice, including if we believe you have violated these Terms. You may
          terminate your account at any time by contacting us at{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>
          .
        </p>
        <p>
          Upon termination, your right to use the Service ceases immediately. Sections 9, 10, 11,
          12, 14, and 15 survive termination.
        </p>
      </LegalSection>

      <LegalSection title="14. Governing law and jurisdiction">
        <p>
          These Terms are governed by and construed in accordance with the laws of India, without
          regard to its conflict of law provisions. Any dispute arising out of or relating to these
          Terms or the Service shall be subject to the exclusive jurisdiction of the courts located
          in Ernakulam, Kerala, India, unless mandatory consumer protection law in your jurisdiction
          requires otherwise.
        </p>
        <p>
          Before initiating formal proceedings, both parties agree to attempt good-faith resolution
          by contacting{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="15. Changes to these Terms">
        <p>
          We may modify these Terms at any time. When we make material changes, we will update the
          &quot;Last updated&quot; date at the top of this page. Continued use of the Service after
          that date constitutes acceptance of the revised Terms. If you do not agree to revised
          Terms, you must stop using the Service.
        </p>
      </LegalSection>

      <LegalSection title="16. Contact">
        <p>
          Questions, corrections, takedown requests, or legal notices:{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline">
            {CONTACT}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
