export type SourceAction = {
  enabled?: boolean;
  trusted?: boolean;
  runRequested?: boolean;
  /** The admin confirms a large drop in openings is real: forget the old count and re-run. */
  acceptCount?: boolean;
};

export type SourcePatch = Partial<{
  enabled: boolean;
  trusted: boolean;
  run_requested: boolean;
  consecutive_failures: number;
  last_item_count: null;
}>;

// The ingest safety net compares each run with last_item_count, so a source re-enabled after
// failures (or with a genuine drop in openings) must start from a fresh baseline.
export function sourcePatch(action: SourceAction): SourcePatch | null {
  const patch: SourcePatch = {};
  if (action.enabled !== undefined) {
    patch.enabled = action.enabled;
    if (action.enabled) {
      patch.consecutive_failures = 0;
      patch.last_item_count = null;
    }
  }
  if (action.trusted !== undefined) patch.trusted = action.trusted;
  if (action.runRequested !== undefined) patch.run_requested = action.runRequested;
  if (action.acceptCount) {
    patch.last_item_count = null;
    patch.run_requested = true;
  }
  return Object.keys(patch).length ? patch : null;
}
