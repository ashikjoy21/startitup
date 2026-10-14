import { describe, expect, it } from "vitest";
import { JOBS_PAGE_SIZE, pageRange, sanitizeTerm, postedLabel, searchWords } from "./jobs-search";

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
