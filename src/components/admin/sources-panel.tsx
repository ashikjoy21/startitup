import { useCallback, useEffect, useState } from "react";

import { getAdminSecret, setAdminSecret } from "@/lib/admin-session";
import {
  adminIngestOverview,
  adminReviewListings,
  adminReviewQueue,
  adminUpdateSource,
  type AdminSourceRow,
  type IngestKpis,
  type ReviewItem,
} from "@/lib/api/ingest-admin.functions";

const KPIS: Array<[Exclude<keyof IngestKpis, "sources_by_method">, string]> = [
  ["live", "Live student listings"],
  ["with_apply_url", "With apply link"],
  ["with_deadline", "With deadline"],
  ["merged_across_sources", "Merged across sources"],
  ["expired_24h", "Expired (24h)"],
  ["needs_review", "Needs review"],
  ["failing_sources", "Failing sources"],
  ["disabled_sources", "Disabled sources"],
  ["orgs_without_source", "Orgs without a source"],
];

const btn = "h-8 border border-border bg-background px-2.5 text-[12.5px] hover:bg-muted disabled:opacity-50";

function ago(iso: string | null): string {
  if (!iso) return "never";
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 48 * 60) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

export function SourcesPanel() {
  const [secret, setSecret] = useState("");
  const [draft, setDraft] = useState("");
  const [kpis, setKpis] = useState<IngestKpis | null>(null);
  const [sources, setSources] = useState<AdminSourceRow[]>([]);
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setSecret(getAdminSecret()), []);

  const load = useCallback(async () => {
    if (!secret) return;
    setBusy(true);
    setError("");
    try {
      const [overview, review] = await Promise.all([
        adminIngestOverview({ data: { adminSecret: secret } }),
        adminReviewQueue({ data: { adminSecret: secret, limit: 100 } }),
      ]);
      setKpis(overview.kpis);
      setSources(overview.sources);
      setQueue(review.items);
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [secret]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(fn: () => Promise<unknown>) {
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (!secret) {
    return (
      <form
        className="flex max-w-sm gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setAdminSecret(draft);
          setSecret(draft);
        }}
      >
        <input
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Admin secret"
          className="h-9 flex-1 border border-border bg-background px-3 text-[13.5px] outline-none focus:border-primary"
        />
        <button className="h-9 bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark">
          Unlock
        </button>
      </form>
    );
  }

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-10">
      {error && (
        <p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-[13px] text-destructive">{error}</p>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-[26px]">Health</h2>
          <button className={btn} disabled={busy} onClick={() => void load()}>
            {busy ? "Loading…" : "Refresh"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {KPIS.map(([key, label]) => (
            <div key={key} className="border border-border px-4 py-3">
              <div className="text-[12px] text-muted-foreground">{label}</div>
              <div className="mt-1 text-[22px] font-medium tabular-nums">{kpis ? kpis[key] : "—"}</div>
            </div>
          ))}
        </div>
        {kpis && (
          <p className="mt-3 text-[12.5px] text-muted-foreground">
            Sources by discovery method:{" "}
            {Object.entries(kpis.sources_by_method)
              .map(([k, v]) => `${k} ${v}`)
              .join(" · ") || "none yet"}
          </p>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-[26px]">Review queue ({queue.length})</h2>
          <div className="flex gap-2">
            <button className={btn} disabled={!selected.size} onClick={() => void act(() => adminReviewListings({ data: { adminSecret: secret, ids: [...selected], decision: "ok" } }))}>
              Approve {selected.size || ""}
            </button>
            <button className={btn} disabled={!selected.size} onClick={() => void act(() => adminReviewListings({ data: { adminSecret: secret, ids: [...selected], decision: "rejected" } }))}>
              Reject {selected.size || ""}
            </button>
          </div>
        </div>
        <table className="w-full text-[13px]">
          <thead className="text-left text-[12px] text-muted-foreground">
            <tr>
              <th className="w-8 py-2">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={queue.length > 0 && selected.size === queue.length}
                  onChange={(e) => setSelected(e.target.checked ? new Set(queue.map((q) => q.id)) : new Set())}
                />
              </th>
              <th>Listing</th>
              <th>Location</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((q) => (
              <tr key={q.id} className="border-t border-border align-top">
                <td className="py-2">
                  <input type="checkbox" aria-label={`Select ${q.name}`} checked={selected.has(q.id)} onChange={() => toggle(q.id)} />
                </td>
                <td className="py-2 pr-4">
                  {q.apply_url ? (
                    <a href={q.apply_url} target="_blank" rel="noreferrer" className="hover:text-primary">
                      {q.name}
                    </a>
                  ) : (
                    q.name
                  )}
                  <div className="text-[12px] text-muted-foreground">
                    {q.org} · {q.kind ?? "—"}
                  </div>
                </td>
                <td className="py-2 pr-4">{q.location}</td>
                <td className="py-2 text-[12px] text-muted-foreground">{q.review_reasons.join("; ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-3 font-serif text-[26px]">Sources ({sources.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[13px]">
            <thead className="text-left text-[12px] text-muted-foreground">
              <tr>
                <th className="py-2">Source</th>
                <th>Method</th>
                <th>Last success</th>
                <th>Items</th>
                <th>Failures</th>
                <th>Last error / note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className={"border-t border-border align-top " + (s.enabled ? "" : "opacity-60")}>
                  <td className="py-2 pr-3">
                    {s.organizations?.name ?? s.slug}
                    <div className="text-[12px] text-muted-foreground">{s.connector}</div>
                  </td>
                  <td className="pr-3">
                    {s.discovery_method}
                    {s.connector === "html" && !s.trusted ? " (untrusted)" : ""}
                  </td>
                  <td className="pr-3">{ago(s.last_success_at)}</td>
                  <td className="pr-3 tabular-nums">{s.last_item_count ?? "—"}</td>
                  <td className="pr-3 tabular-nums">{s.consecutive_failures}</td>
                  <td className="max-w-[280px] pr-3 text-[12px] text-muted-foreground">{s.last_error ?? s.permission_note}</td>
                  <td className="whitespace-nowrap py-2">
                    <div className="flex gap-1.5">
                      <button className={btn} onClick={() => void act(() => adminUpdateSource({ data: { adminSecret: secret, id: s.id, enabled: !s.enabled } }))}>
                        {s.enabled ? "Disable" : "Enable"}
                      </button>
                      {s.connector === "html" && !s.trusted && (
                        <button className={btn} onClick={() => void act(() => adminUpdateSource({ data: { adminSecret: secret, id: s.id, trusted: true } }))}>
                          Trust
                        </button>
                      )}
                      <button className={btn} disabled={s.run_requested} onClick={() => void act(() => adminUpdateSource({ data: { adminSecret: secret, id: s.id, runRequested: true } }))}>
                        {s.run_requested ? "Queued" : "Run next"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
