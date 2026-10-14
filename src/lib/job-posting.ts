// schema.org JobPosting for Google for Jobs. Only emitted when the posting has what Google requires
// (title, a real description, date posted, employer, location); otherwise the page is not indexed as a job.

export type JobDetail = {
  id: string;
  title: string;
  org: string;
  orgWebsite: string | null;
  logo: string;
  description: string;
  locations: string[];
  country: string | null;
  workMode: string | null;
  kind: string | null;
  roleFamily: string | null;
  postedAt: string | null;
  firstSeenAt: string;
  deadlineAt: string | null;
  experienceMin: number | null;
  experienceMax: number | null;
  payMin: number | null;
  payMax: number | null;
  payCurrency: string | null;
  payPeriod: string | null;
  applyUrl: string;
  status: string;
};

export const MIN_DESCRIPTION = 200;
const SITE = "https://startitup.in";

export function jobUrl(id: string): string {
  return `${SITE}/jobs/${encodeURIComponent(id)}`;
}

/** Jobs worth indexing: live, with a real description. Thin pages hurt the whole site in search. */
export function isIndexable(job: Pick<JobDetail, "status" | "description">): boolean {
  return job.status === "published" && job.description.trim().length >= MIN_DESCRIPTION;
}

function escapeHtml(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/** Plain-text description → the simple HTML Google expects (paragraphs and line breaks). */
export function descriptionHtml(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const UNIT: Record<string, string> = {
  hour: "HOUR",
  day: "DAY",
  week: "WEEK",
  month: "MONTH",
  year: "YEAR",
};

export function jobPostingJsonLd(job: JobDetail): Record<string, unknown> | null {
  if (!isIndexable(job)) return null;
  const remote = job.workMode === "remote";
  const places = job.locations.slice(0, 10).map((city) => ({
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: job.country ?? "IN",
    },
  }));
  if (!remote && places.length === 0) return null;

  const posting: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: descriptionHtml(job.description),
    identifier: { "@type": "PropertyValue", name: job.org, value: job.id },
    datePosted: (job.postedAt ?? job.firstSeenAt).slice(0, 10),
    hiringOrganization: {
      "@type": "Organization",
      name: job.org,
      ...(job.orgWebsite ? { sameAs: job.orgWebsite } : {}),
      ...(job.logo ? { logo: job.logo } : {}),
    },
    url: jobUrl(job.id),
    directApply: false,
  };
  if (places.length) posting.jobLocation = places;
  if (remote) {
    posting.jobLocationType = "TELECOMMUTE";
    posting.applicantLocationRequirements = { "@type": "Country", name: "India" };
  }
  if (job.deadlineAt) posting.validThrough = job.deadlineAt;
  if (job.kind === "internship") posting.employmentType = "INTERN";
  if (job.experienceMin !== null && job.experienceMin > 0) {
    posting.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      monthsOfExperience: job.experienceMin * 12,
    };
  }
  const unit = job.payPeriod ? UNIT[job.payPeriod] : undefined;
  if (job.payMin !== null && job.payCurrency && unit) {
    posting.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.payCurrency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job.payMin,
        ...(job.payMax !== null ? { maxValue: job.payMax } : {}),
        unitText: unit,
      },
    };
  }
  return posting;
}
