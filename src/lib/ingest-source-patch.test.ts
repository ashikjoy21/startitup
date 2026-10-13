import { describe, expect, it } from "vitest";
import { sourcePatch } from "./ingest-source-patch";

describe("sourcePatch", () => {
  it("re-enabling clears failures and the item-count baseline", () => {
    expect(sourcePatch({ enabled: true })).toEqual({ enabled: true, consecutive_failures: 0, last_item_count: null });
  });

  it("accepting a new count drops the baseline and queues a run", () => {
    expect(sourcePatch({ acceptCount: true })).toEqual({ last_item_count: null, run_requested: true });
  });

  it("passes through trust, disable and run requests", () => {
    expect(sourcePatch({ enabled: false, trusted: true, runRequested: true })).toEqual({
      enabled: false,
      trusted: true,
      run_requested: true,
    });
  });

  it("returns null when there is nothing to change", () => {
    expect(sourcePatch({})).toBeNull();
  });
});
