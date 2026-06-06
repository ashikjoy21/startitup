import { useState } from "react";

const FEATURES = [
  "Generate grant applications",
  "Create pitch decks",
  "Prepare investor materials",
  "Track startup tasks",
];

export function LoopTeaser() {
  const [notified, setNotified] = useState(false);

  return (
    <div className="border border-border bg-card p-6">
      <div className="inline-block bg-primary/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-primary">
        Coming Soon
      </div>
      <h3 className="mt-2 font-serif text-[24px]">LOOP Workspace</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Your AI co-founder for applications, decks, and fundraising.
      </p>
      <ul className="mt-3 space-y-1.5">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-foreground/70">
            <span className="text-primary">→</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-5">
        {notified ? (
          <p className="text-[13px] text-primary">
            You're on the list. We'll let you know when LOOP launches.
          </p>
        ) : (
          <button
            onClick={() => setNotified(true)}
            className="bg-primary px-5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
          >
            Notify Me
          </button>
        )}
      </div>
    </div>
  );
}
