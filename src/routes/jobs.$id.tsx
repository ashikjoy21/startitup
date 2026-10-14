import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { OrgLogo } from "@/components/opportunity-row";
import { getJob, type JobListing } from "@/lib/api/jobs.functions";
import { isIndexable, jobPostingJsonLd, jobUrl, type JobDetail } from "@/lib/job-posting";
import { postedLabel } from "@/lib/jobs-search";

export const Route = createFileRoute("/jobs/$id")({
  loader: async ({ params }) => {
    const result = await getJob({ data: { id: decodeURIComponent(params.id) } });
    if (!result.job) throw notFound();
    return { job: result.job as JobDetail, similar: result.similar };
  },
  head: ({ params, loaderData }) => {
    const job = loaderData?.job;
    if (!job) return { meta: [{ title: "Job — StartItUp.in" }] };
    const city = job.locations[0] || (job.workMode === "remote" ? "Remote" : "India");
    const title = `${job.title} at ${job.org} — ${city} | StartItUp.in`;
    const description =
      job.description.trim().replace(/\s+/g, " ").slice(0, 155) ||
      `${job.title} at ${job.org} in ${city}. View details and apply on the employer's careers site.`;
    const jsonLd = jobPostingJsonLd(job);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:image", content: "https://startitup.in/og-careers.png" },
        { name: "twitter:image", content: "https://startitup.in/og-careers.png" },
        { property: "og:description", content: description },
        { property: "og:url", content: jobUrl(params.id) },
        ...(!isIndexable(job) ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      links: [{ rel: "canonical", href: jobUrl(params.id) }],
      ...(jsonLd
        ? { scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }] }
        : {}),
    };
  },
  component: JobDetailPage,
});

function JobDetailPage() {
  const { job, similar } = Route.useLoaderData();
  const city = job.locations[0] || (job.workMode === "remote" ? "Remote" : "India");
  const closed = job.status !== "published";
  const paragraphs = job.description
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <SiteLayout>
      <article className="mx-auto max-w-[1280px] px-6 py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
          <Link to="/jobs" className="hover:text-primary">
            Jobs
          </Link>
          {job.roleFamily && (
            <>
              {" "}
              ›{" "}
              <Link
                to="/jobs/role/$role"
                params={{
                  role: job.roleFamily
                    .toLowerCase()
                    .replace(/&/g, " ")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                }}
                className="hover:text-primary"
              >
                {job.roleFamily}
              </Link>
            </>
          )}
          <span> › {job.title}</span>
        </nav>
        {closed && (
          <div className="mt-6 border border-border bg-primary-soft p-4 text-[14px]">
            This role has closed.
          </div>
        )}
        <header className="mt-8 flex items-start gap-4 md:gap-6">
          <OrgLogo logo={job.logo} org={job.org} size={14} />
          <div className="min-w-0">
            <h1 className="font-serif text-[38px] leading-[1.08] md:text-[56px]">{job.title}</h1>
            <p className="mt-2 text-[15px] text-muted-foreground">{job.org}</p>
          </div>
        </header>
        <dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
          {facts(job).map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 text-[13.5px]">{value}</dd>
            </div>
          ))}
        </dl>
        {!closed && (
          <div className="mt-8">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex h-12 w-full items-center justify-center bg-primary px-6 text-[14px] font-medium text-primary-foreground hover:opacity-90 sm:w-auto"
            >
              Apply on {job.org}'s site ↗
            </a>
            <p className="mt-3 text-[12.5px] text-muted-foreground">
              Read directly from {job.org}'s careers site. StartItUp never charges candidates.
            </p>
          </div>
        )}
        <Share title={`${job.title} at ${job.org}`} />
        <section className="mt-10 max-w-[72ch] text-[15px] leading-[1.75]">
          <h2 className="font-serif text-[30px]">About this role</h2>
          {paragraphs.length && job.description.length >= 200 ? (
            <div className="mt-4 space-y-5">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-muted-foreground">
              The full description is on {job.org}'s careers site
              {!closed && (
                <>
                  .{" "}
                  <a
                    className="text-primary underline"
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    View it here ↗
                  </a>
                </>
              )}
              .
            </p>
          )}
        </section>
        {similar.length > 0 && (
          <section className="mt-16 border-t border-border pt-8">
            <h2 className="font-serif text-[30px]">Similar roles</h2>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {similar.map((item) => (
                <SimilarRow key={item.id} job={item} />
              ))}
            </ul>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}

function facts(job: JobDetail): [string, string][] {
  const out: [string, string][] = [
    ["Location", job.locations.join(", ") || (job.workMode === "remote" ? "Remote" : "India")],
  ];
  if (job.workMode)
    out.push([
      "Work mode",
      { onsite: "On-site", hybrid: "Hybrid", remote: "Remote" }[job.workMode] ?? job.workMode,
    ]);
  if (job.experienceMin !== null)
    out.push([
      "Experience",
      `${job.experienceMin}${job.experienceMax !== null ? `–${job.experienceMax}` : "+"} years`,
    ]);
  if (job.payMin !== null)
    out.push([
      "Pay",
      `${job.payCurrency ?? ""} ${job.payMin.toLocaleString("en-IN")}${job.payMax !== null ? `–${job.payMax.toLocaleString("en-IN")}` : ""}${job.payPeriod ? ` / ${job.payPeriod}` : ""}`.trim(),
    ]);
  const posted = postedLabel(job.postedAt ?? job.firstSeenAt);
  if (posted) out.push(["Posted", posted]);
  if (job.deadlineAt) out.push(["Deadline", new Date(job.deadlineAt).toLocaleDateString("en-IN")]);
  if (job.roleFamily) out.push(["Role family", job.roleFamily]);
  return out;
}

function SimilarRow({ job }: { job: JobListing }) {
  return (
    <li className="flex items-center gap-3 py-4">
      <OrgLogo logo={job.logo} org={job.org} size={8} />
      <div className="min-w-0 flex-1">
        <Link
          to="/jobs/$id"
          params={{ id: job.id }}
          className="text-[14px] font-medium hover:text-primary hover:underline"
        >
          {job.title}
        </Link>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          {job.org} · {job.locations.join(", ") || "India"}
        </p>
      </div>
      <span className="text-[12px] text-muted-foreground">{postedLabel(job.postedAt)}</span>
    </li>
  );
}

function Share({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : window.location.href;
  async function share() {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }
  const text = encodeURIComponent(title);
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px]">
      <span className="text-muted-foreground">Share this role</span>
      <button
        aria-label="Share job"
        onClick={() => void share()}
        className="border border-border px-3 py-2 hover:text-primary"
      >
        Share
      </button>
      <a
        aria-label="Share on WhatsApp"
        href={`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-border px-3 py-2 hover:text-primary"
      >
        WhatsApp
      </a>
      <a
        aria-label="Share on X"
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-border px-3 py-2 hover:text-primary"
      >
        X
      </a>
      <a
        aria-label="Share on Telegram"
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-border px-3 py-2 hover:text-primary"
      >
        Telegram
      </a>
      <button
        aria-label="Copy job link"
        onClick={() => void navigator.clipboard.writeText(url).then(() => setCopied(true))}
        className="border border-border px-3 py-2 hover:text-primary"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
