import { describe, expect, it } from "vitest";
import { descriptionHtml, isIndexable, jobPostingJsonLd, type JobDetail } from "./job-posting";

const base: JobDetail = {
  id: "acme-data-analyst-pune-1abc",
  title: "Data Analyst",
  org: "Acme",
  orgWebsite: "https://acme.com",
  logo: "https://acme.com/logo.png",
  description: "Analyse sales data and build dashboards for the business. ".repeat(6),
  locations: ["Pune", "Mumbai"],
  country: "IN",
  workMode: "hybrid",
  kind: "job",
  roleFamily: "Data & AI",
  postedAt: "2026-10-10T05:00:00Z",
  firstSeenAt: "2026-10-11T00:00:00Z",
  lastVerifiedAt: "2026-10-14T06:00:00Z",
  deadlineAt: null,
  experienceMin: 2,
  experienceMax: 4,
  payMin: 600000,
  payMax: 900000,
  payCurrency: "INR",
  payPeriod: "year",
  applyUrl: "https://acme.com/jobs/1",
  status: "published",
};

describe("jobPostingJsonLd", () => {
  it("builds a Google for Jobs posting with locations, experience and pay", () => {
    const ld = jobPostingJsonLd(base)!;
    expect(ld).toMatchObject({
      "@type": "JobPosting",
      title: "Data Analyst",
      datePosted: "2026-10-10",
      directApply: false,
      url: "https://startitup.in/jobs/acme-data-analyst-pune-1abc",
      hiringOrganization: { name: "Acme", sameAs: "https://acme.com" },
      experienceRequirements: { monthsOfExperience: 24 },
      baseSalary: { currency: "INR", value: { minValue: 600000, maxValue: 900000, unitText: "YEAR" } },
    });
    expect(ld.jobLocation).toEqual([
      { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Pune", addressCountry: "IN" } },
      { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressCountry: "IN" } },
    ]);
  });

  it("marks remote roles as telecommute open to India", () => {
    const ld = jobPostingJsonLd({ ...base, workMode: "remote", locations: [] })!;
    expect(ld).toMatchObject({ jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { name: "India" } });
    expect(ld).not.toHaveProperty("jobLocation");
  });

  it("falls back to the first-seen date and skips unknown pay periods", () => {
    const ld = jobPostingJsonLd({ ...base, postedAt: null, payPeriod: null })!;
    expect(ld.datePosted).toBe("2026-10-11");
    expect(ld).not.toHaveProperty("baseSalary");
  });

  it("emits nothing for thin, closed or location-less postings", () => {
    expect(jobPostingJsonLd({ ...base, description: "Short." })).toBeNull();
    expect(jobPostingJsonLd({ ...base, status: "expired" })).toBeNull();
    expect(jobPostingJsonLd({ ...base, locations: [], workMode: "onsite" })).toBeNull();
    expect(isIndexable({ status: "published", description: "x".repeat(250) })).toBe(true);
  });
});

describe("descriptionHtml", () => {
  it("escapes markup and keeps paragraphs and line breaks", () => {
    expect(descriptionHtml("Role <b>\nline two\n\nNext para & more")).toBe("<p>Role &lt;b&gt;<br>line two</p><p>Next para &amp; more</p>");
  });
});
