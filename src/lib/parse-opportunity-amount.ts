const LAKH = 100_000;
const CRORE = 10_000_000;
const USD_TO_INR = 83;

const NON_MONETARY =
  /^(free|fully funded|n\/a|—|-+|varies|rolling|equity-free|incubation|mentorship|credits available)/i;

function parseNumeric(value: string): number | null {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseTokenToInr(token: string): number | null {
  const t = token.trim();
  if (!t || NON_MONETARY.test(t)) return null;

  const usd = t.match(/\$\s*([\d,.]+)\s*(k|m|million|billion)?/i);
  if (usd) {
    let n = parseNumeric(usd[1]);
    if (n == null) return null;
    const suffix = usd[2]?.toLowerCase();
    if (suffix === "k") n *= 1_000;
    if (suffix === "m" || suffix === "million") n *= 1_000_000;
    if (suffix === "billion") n *= 1_000_000_000;
    return n * USD_TO_INR;
  }

  const croreWord = t.match(/([\d,.]+)\s*(?:crore|crores|cr)\b/i);
  if (croreWord) {
    const n = parseNumeric(croreWord[1]);
    return n == null ? null : n * CRORE;
  }

  const lakhWord = t.match(/([\d,.]+)\s*(?:lakh|lakhs|lac|l)\b/i);
  if (lakhWord) {
    const n = parseNumeric(lakhWord[1]);
    return n == null ? null : n * LAKH;
  }

  const inr = t.match(/₹\s*([\d,.]+)/);
  if (inr) return parseNumeric(inr[1]);

  return null;
}

/** Best-effort max INR value from a free-text amount field. */
export function parseAmountToInrMax(amount: string): number | null {
  if (!amount?.trim() || amount === "—") return null;

  const segments = amount.split(/\s*[\/|;]\s*|\s+to\s+|\s*[–—]\s*/i);
  let max: number | null = null;

  for (const segment of [amount, ...segments]) {
    const value = parseTokenToInr(segment);
    if (value != null) max = max == null ? value : Math.max(max, value);
  }

  return max;
}

/** Conservative INR estimate — midpoints for ranges, haircut on "up to" ceilings. */
export function parseAmountToInrTypical(amount: string): number | null {
  if (!amount?.trim() || amount === "—") return null;

  const rangeParts = amount.split(/\s*[–—]\s*/);
  if (rangeParts.length >= 2) {
    const values = rangeParts
      .map((part) => parseTokenToInr(part))
      .filter((v): v is number => v != null);
    if (values.length >= 2) {
      const low = Math.min(...values);
      const high = Math.max(...values);
      return Math.round((low + high) / 2);
    }
  }

  const max = parseAmountToInrMax(amount);
  if (max == null) return null;

  if (/up to|upto/i.test(amount)) return Math.round(max * 0.5);
  return Math.round(max * 0.75);
}

export function sumOpportunityAmounts(amounts: string[]): {
  totalInr: number;
  pricedCount: number;
} {
  let totalInr = 0;
  let pricedCount = 0;

  for (const amount of amounts) {
    const value = parseAmountToInrMax(amount);
    if (value != null) {
      totalInr += value;
      pricedCount += 1;
    }
  }

  return { totalInr, pricedCount };
}

export function estimateFundingFromAmounts(amounts: string[]): {
  totalInr: number;
  pricedCount: number;
} {
  let totalInr = 0;
  let pricedCount = 0;

  for (const amount of amounts) {
    const value = parseAmountToInrTypical(amount);
    if (value != null) {
      totalInr += value;
      pricedCount += 1;
    }
  }

  return { totalInr, pricedCount };
}

export function formatInrCompact(amountInr: number): string {
  if (amountInr >= CRORE) {
    const cr = amountInr / CRORE;
    return `₹${cr >= 100 ? Math.round(cr) : cr.toFixed(1).replace(/\.0$/, "")}Cr`;
  }
  if (amountInr >= LAKH) {
    return `₹${Math.round(amountInr / LAKH)}L`;
  }
  if (amountInr >= 1_000) {
    return `₹${Math.round(amountInr / 1_000)}K`;
  }
  return `₹${Math.round(amountInr)}`;
}
