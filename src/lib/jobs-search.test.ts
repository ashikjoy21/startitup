import { describe, expect, it } from "vitest";
import { JOBS_PAGE_SIZE, pageRange, sanitizeTerm, postedLabel, searchWords, toSlug, roleFromSlug, verifiedLabel } from "./jobs-search";

describe("jobs search helpers", () => {
  it("strips characters that would break a PostgREST or() filter", () => {
    expect(sanitizeTerm("  data, analyst (remote)% ")).toBe("data analyst remote");
    expect(sanitizeTerm("")).toBeUndefined();
    expect(sanitizeTerm("   ")).toBeUndefined();
    expect(sanitizeTerm("a".repeat(200))?.length).toBe(80);
  });

  it("turns a 1-based page into a row range", () => {
    expect(pageRange(1)).toEqual([0, JOBS_PAGE_SIZE - 1]);
    expect(pageRange(3)).toEqual([2 * JOBS_PAGE_SIZE, 3 * JOBS_PAGE_SIZE - 1]);
    expect(pageRange(0)).toEqual([0, JOBS_PAGE_SIZE - 1]);
    expect(pageRange(10_000)[0]).toBeLessThanOrEqual(200 * JOBS_PAGE_SIZE);
  });

  it("labels posting age", () => {
    const now = new Date("2026-10-14T12:00:00Z");
    expect(postedLabel("2026-10-14T03:00:00Z", now)).toBe("Today");
    expect(postedLabel("2026-10-13T03:00:00Z", now)).toBe("Yesterday");
    expect(postedLabel("2026-10-04T03:00:00Z", now)).toBe("10 days ago");
    expect(postedLabel("2026-06-01T00:00:00Z", now)).toBe("Over a month ago");
    expect(postedLabel(null, now)).toBe("");
  });
});

describe("searchWords", () => {
  it("splits a query into distinct words and drops filler", () => {
    expect(searchWords("Data Analyst jobs in Pune")).toEqual(["data", "analyst", "pune"]);
    expect(searchWords("java, java (remote)")).toEqual(["java", "remote"]);
    expect(searchWords("  ")).toEqual([]);
  });
});

describe("landing page slugs", () => {
  it("round-trips role families and slugs cities", () => {
    expect(toSlug("Data & AI")).toBe("data-ai");
    expect(toSlug("Finance, Banking & Insurance")).toBe("finance-banking-insurance");
    expect(toSlug("New Delhi")).toBe("new-delhi");
    expect(roleFromSlug("data-ai")).toBe("Data & AI");
    expect(roleFromSlug("nope")).toBeUndefined();
  });
});

describe("verifiedLabel", () => {
  const now = new Date("2026-10-14T12:00:00Z");
  it("shows how recently the role was seen live on the employer site", () => {
    expect(verifiedLabel("2026-10-14T11:20:00Z", now)).toEqual({ text: "Verified live · 40 min ago", fresh: true });
    expect(verifiedLabel("2026-10-14T06:30:00Z", now)).toEqual({ text: "Verified live · 5h ago", fresh: true });
    expect(verifiedLabel("2026-10-13T06:00:00Z", now)).toEqual({ text: "Last checked yesterday", fresh: false });
    expect(verifiedLabel("2026-10-10T12:00:00Z", now)).toEqual({ text: "Last checked 4 days ago", fresh: false });
    expect(verifiedLabel(null, now)).toBeNull();
  });
});
