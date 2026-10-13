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

const btn =
  "h-8 border border-border bg-background px-2.5 text-[12.5px] hover:bg-muted disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

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
        className="flex w-full max-w-sm flex-col gap-2 sm:flex-row"
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
          aria-label="Admin secret"
          placeholder="Admin secret"
          className="h-9 flex-1 border border-border bg-background px-3 text-[13.5px] outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <button className="h-9 bg-primary px-4 text-[13.5px] font-medium text-primary-foreground hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
    <div className="min-w-0 space-y-12">
      {error && (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-[13px] text-destructive"
        >
          {error}
        </p>
      )}

      <section aria-labelledby="source-health-heading" className="min-w-0">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              01 · Health
            </p>
            <h2 id="source-health-heading" className="font-serif text-[30px] leading-none">
              Ingestion at a glance
            </h2>
          </div>
          <button type="button" className={btn} disabled={busy} onClick={() => void load()}>
            {busy ? "Loading…" : "Refresh"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {KPIS.map(([key, label]) => {
            const emphasized =
              (key === "needs_review" || key === "failing_sources") && Number(kpis?.[key] ?? 0) > 0;
            return (
              <div
                key={key}
                className={`border px-3 py-3 sm:px-4 ${emphasized ? "border-primary bg-primary-soft" : "border-border bg-card"}`}
              >
                <div
                  className={`text-[11px] leading-snug ${emphasized ? "text-primary" : "text-muted-foreground"}`}
                >
                  {label}
                </div>
                <div
                  className={`mt-2 font-serif text-[27px] leading-none tabular-nums ${emphasized ? "text-primary" : ""}`}
                >
                  {kpis ? kpis[key] : "—"}
                </div>
              </div>
            );
          })}
        </div>
        {kpis && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            Discovery methods <span className="px-1">·</span>
            {Object.entries(kpis.sources_by_method)
              .map(([k, v]) => `${k} ${v}`)
              .join(" · ") || "none yet"}
          </p>
        )}
      </section>

      <section aria-labelledby="review-queue-heading" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              02 · Review queue
            </p>
            <h2 id="review-queue-heading" className="font-serif text-[30px] leading-none">
              Listings to review{" "}
              <span className="font-sans text-[13px] text-muted-foreground">({queue.length})</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className={btn}
              disabled={!selected.size || busy}
              onClick={() =>
                void act(() =>
                  adminReviewListings({
                    data: { adminSecret: secret, ids: [...selected], decision: "ok" },
                  }),
                )
              }
            >
              Approve {selected.size || ""}
            </button>
            <button
              type="button"
              className={btn}
              disabled={!selected.size || busy}
              onClick={() =>
                void act(() =>
                  adminReviewListings({
                    data: { adminSecret: secret, ids: [...selected], decision: "rejected" },
                  }),
                )
              }
            >
              Reject {selected.size || ""}
            </button>
          </div>
        </div>
        <div
          className="overflow-x-auto border-y border-border"
          role="region"
          aria-label="Review queue listings"
          tabIndex={0}
        >
          <table className="w-full min-w-[620px] bg-card text-left text-[13px]">
            <thead className="border-b border-border text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3">
                  <input
                    className="accent-primary focus-visible:ring-2 focus-visible:ring-ring"
                    type="checkbox"
                    aria-label="Select all listings"
                    checked={queue.length > 0 && selected.size === queue.length}
                    onChange={(e) =>
                      setSelected(e.target.checked ? new Set(queue.map((q) => q.id)) : new Set())
                    }
                  />
                </th>
                <th className="px-3 py-3">Listing</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Why it needs review</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q) => (
                <tr key={q.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-3 py-3">
                    <input
                      className="accent-primary focus-visible:ring-2 focus-visible:ring-ring"
                      type="checkbox"
                      aria-label={`Select ${q.name}`}
                      checked={selected.has(q.id)}
                      onChange={() => toggle(q.id)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    {q.apply_url ? (
                      <a
                        href={q.apply_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {q.name}
                      </a>
                    ) : (
                      q.name
                    )}
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {q.org} · {q.kind ?? "—"}
                    </div>
                  </td>
                  <td className="px-3 py-3">{q.location}</td>
                  <td className="px-3 py-3 text-[12px] text-muted-foreground">
                    {q.review_reasons.join("; ")}
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-[13px] text-muted-foreground"
                  >
                    The queue is clear for now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="sources-heading" className="min-w-0">
        <div className="mb-4">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            03 · Sources
          </p>
          <h2 id="sources-heading" className="font-serif text-[30px] leading-none">
            Sources{" "}
            <span className="font-sans text-[13px] text-muted-foreground">({sources.length})</span>
          </h2>
          <p className="mt-2 text-[12px] text-muted-foreground">
            A quiet view of the feeds behind the listings.
          </p>
        </div>
        <div
          className="overflow-x-auto border-y border-border"
          role="region"
          aria-label="Ingestion sources"
          tabIndex={0}
        >
          <table className="w-full min-w-[900px] bg-card text-left text-[13px]">
            <thead className="border-b border-border text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Method</th>
                <th className="px-3 py-3">Last success</th>
                <th className="px-3 py-3">Items</th>
                <th className="px-3 py-3">Failures</th>
                <th className="px-3 py-3">Last error / note</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => {
                const status = !s.enabled
                  ? "Disabled"
                  : s.consecutive_failures > 0
                    ? "Failing"
                    : s.connector === "html" && !s.trusted
                      ? "Untrusted HTML"
                      : "Healthy";
                const statusClass = !s.enabled
                  ? "border-border text-muted-foreground"
                  : s.consecutive_failures > 0
                    ? "border-destructive/40 text-destructive"
                    : s.connector === "html" && !s.trusted
                      ? "border-primary/30 text-primary"
                      : "border-primary/30 text-primary";
                return (
                  <tr key={s.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-3 py-3">
                      <div className="font-medium">{s.organizations?.name ?? s.slug}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{s.connector}</div>
                      <span
                        className={`mt-2 inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] ${statusClass}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${!s.enabled ? "bg-muted-foreground" : s.consecutive_failures > 0 ? "bg-destructive" : "bg-primary"}`}
                        />
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-3">{s.discovery_method}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{ago(s.last_success_at)}</td>
                    <td className="px-3 py-3 tabular-nums">{s.last_item_count ?? "—"}</td>
                    <td
                      className={`px-3 py-3 tabular-nums ${s.consecutive_failures > 0 ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {s.consecutive_failures}
                    </td>
                    <td className="max-w-[280px] px-3 py-3 text-[12px] text-muted-foreground">
                      {s.last_error ??
                        s.permission_note ??
                        (s.connector === "html" && !s.trusted
                          ? "HTML source needs trust review."
                          : "—")}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          aria-label={`${s.enabled ? "Disable" : "Enable"} ${s.organizations?.name ?? s.slug}`}
                          className={btn}
                          disabled={busy}
                          onClick={() =>
                            void act(() =>
                              adminUpdateSource({
                                data: { adminSecret: secret, id: s.id, enabled: !s.enabled },
                              }),
                            )
                          }
                        >
                          {s.enabled ? "Disable" : "Enable"}
                        </button>
                        {s.connector === "html" && !s.trusted && (
                          <button
                            type="button"
                            aria-label={`Trust ${s.organizations?.name ?? s.slug}`}
                            className={btn}
                            disabled={busy}
                            onClick={() =>
                              void act(() =>
                                adminUpdateSource({
                                  data: { adminSecret: secret, id: s.id, trusted: true },
                                }),
                              )
                            }
                          >
                            Trust
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label={`${s.run_requested ? "Run queued for" : "Run next for"} ${s.organizations?.name ?? s.slug}`}
                          className={btn}
                          disabled={s.run_requested || busy}
                          onClick={() =>
                            void act(() =>
                              adminUpdateSource({
                                data: { adminSecret: secret, id: s.id, runRequested: true },
                              }),
                            )
                          }
                        >
                          {s.run_requested ? "Queued" : "Run next"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sources.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-8 text-center text-[13px] text-muted-foreground"
                  >
                    No sources configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
