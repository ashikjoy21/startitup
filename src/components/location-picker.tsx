import {
  formatProfileLocation,
  INDIAN_STATES,
  LOCATION_COUNTRIES,
  parseProfileLocation,
} from "@/lib/location-options";

type Props = {
  value: string;
  onChange: (location: string) => void;
  selectClass?: string;
  compact?: boolean;
};

export function LocationPicker({ value, onChange, selectClass, compact }: Props) {
  const parsed = parseProfileLocation(value);
  const country = parsed.country || "India";
  const state = parsed.state;

  const fieldClass =
    selectClass ??
    "w-full border border-border bg-background px-3 py-2.5 text-[14px] text-foreground focus:border-primary focus:outline-none";

  const labelClass = compact
    ? "mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
    : "block text-[12.5px] font-medium text-muted-foreground";

  function setCountry(next: string) {
    onChange(formatProfileLocation(next, next === "India" ? state : ""));
  }

  function setState(next: string) {
    onChange(formatProfileLocation("India", next));
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-1.5"}>
      <label className="block">
        <span className={labelClass}>Country</span>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={fieldClass}
        >
          {LOCATION_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {country === "India" && (
        <label className="block">
          <span className={labelClass}>State / UT</span>
          <select value={state} onChange={(e) => setState(e.target.value)} className={fieldClass}>
            <option value="">Select state (recommended)</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-muted-foreground">
            State-wise grants (Goa, Kerala, etc.) match more accurately with your state.
          </p>
        </label>
      )}
    </div>
  );
}
