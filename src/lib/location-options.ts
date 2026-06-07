/** Countries where founders may be based. India is the primary market. */
export const LOCATION_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Singapore",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "Germany",
  "Other",
] as const;

export type LocationCountry = (typeof LOCATION_COUNTRIES)[number];

/** Indian states and union territories — used for state-wise grant matching. */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

const STATE_LOOKUP = new Map<string, IndianState>(
  INDIAN_STATES.flatMap((state) => {
    const key = state.toLowerCase();
    const aliases: string[] = [key];
    if (state === "Tamil Nadu") aliases.push("tamil nadu", "tamilnadu", "tn");
    if (state === "Andhra Pradesh") aliases.push("andhra", "ap");
    if (state === "Madhya Pradesh") aliases.push("mp");
    if (state === "Himachal Pradesh") aliases.push("hp");
    if (state === "Uttar Pradesh") aliases.push("up");
    if (state === "West Bengal") aliases.push("bengal", "wb");
    if (state === "Jammu and Kashmir") aliases.push("j&k", "jammu", "kashmir");
    return aliases.map((a) => [a, state] as const);
  }),
);

/** Cities and regions that appear in opportunity location fields → canonical state. */
export const CITY_TO_INDIAN_STATE: Record<string, IndianState> = {
  bangalore: "Karnataka",
  bengaluru: "Karnataka",
  mumbai: "Maharashtra",
  pune: "Maharashtra",
  nagpur: "Maharashtra",
  delhi: "Delhi",
  "new delhi": "Delhi",
  noida: "Uttar Pradesh",
  gurugram: "Haryana",
  gurgaon: "Haryana",
  hyderabad: "Telangana",
  chennai: "Tamil Nadu",
  coimbatore: "Tamil Nadu",
  kolkata: "West Bengal",
  ahmedabad: "Gujarat",
  surat: "Gujarat",
  jaipur: "Rajasthan",
  lucknow: "Uttar Pradesh",
  indore: "Madhya Pradesh",
  bhubaneswar: "Odisha",
  kochi: "Kerala",
  trivandrum: "Kerala",
  thiruvananthapuram: "Kerala",
  visakhapatnam: "Andhra Pradesh",
  vijayawada: "Andhra Pradesh",
  chandigarh: "Chandigarh",
  goa: "Goa",
  gujarat: "Gujarat",
  karnataka: "Karnataka",
  kerala: "Kerala",
  maharashtra: "Maharashtra",
  rajasthan: "Rajasthan",
  telangana: "Telangana",
  punjab: "Punjab",
  haryana: "Haryana",
  assam: "Assam",
  odisha: "Odisha",
  bihar: "Bihar",
  jharkhand: "Jharkhand",
  uttarakhand: "Uttarakhand",
  "himachal pradesh": "Himachal Pradesh",
  "madhya pradesh": "Madhya Pradesh",
  "west bengal": "West Bengal",
  "andhra pradesh": "Andhra Pradesh",
  "arunachal pradesh": "Arunachal Pradesh",
  "tamil nadu": "Tamil Nadu",
};

export function normalizeIndianState(input: string): IndianState | null {
  const key = input.trim().toLowerCase();
  if (!key) return null;
  return STATE_LOOKUP.get(key) ?? CITY_TO_INDIAN_STATE[key] ?? null;
}

/** Canonical string stored in profiles.location — e.g. "India, Karnataka". */
export function formatProfileLocation(country: string, state: string): string {
  if (!country) return "";
  if (country === "India") {
    if (state) return `India, ${state}`;
    return "India";
  }
  return country;
}

export function parseProfileLocation(location: string | null | undefined): {
  country: string;
  state: string;
} {
  if (!location?.trim()) return { country: "India", state: "" };

  const trimmed = location.trim();
  const indiaWithState = /^india,\s*(.+)$/i.exec(trimmed);
  if (indiaWithState) {
    const rawState = indiaWithState[1].trim();
    return { country: "India", state: normalizeIndianState(rawState) ?? rawState };
  }

  if (/^india$/i.test(trimmed)) return { country: "India", state: "" };

  const asState = normalizeIndianState(trimmed);
  if (asState) return { country: "India", state: asState };

  const knownCountry = LOCATION_COUNTRIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (knownCountry) return { country: knownCountry, state: "" };

  // Legacy free-text (e.g. "Bangalore, Kerala") — best-effort parse
  const tokens = trimmed.split(/[,/]/).map((t) => t.trim()).filter(Boolean);
  for (const token of tokens) {
    const state = normalizeIndianState(token);
    if (state) return { country: "India", state };
  }

  return { country: "India", state: "" };
}

/** Detect if an opportunity location is tied to a specific Indian state. */
export function resolveStateFromOpportunityLocation(location: string): IndianState | null {
  const trimmed = location.trim();
  if (!trimmed || /^india$/i.test(trimmed) || /global|remote|worldwide|anywhere/i.test(trimmed)) {
    return null;
  }

  const direct = normalizeIndianState(trimmed);
  if (direct) return direct;

  const segments = trimmed.split(/[/,]/).map((s) => s.trim()).filter(Boolean);
  for (const segment of segments) {
    const state = normalizeIndianState(segment);
    if (state) return state;
  }

  const lower = trimmed.toLowerCase();
  for (const state of INDIAN_STATES) {
    if (lower.includes(state.toLowerCase())) return state;
  }

  for (const [city, state] of Object.entries(CITY_TO_INDIAN_STATE)) {
    if (lower.includes(city)) return state;
  }

  return null;
}

export function isPanIndiaOpportunityLocation(location: string): boolean {
  const l = location.trim().toLowerCase();
  return l === "india" || /pan[- ]?india|all india|nationwide/i.test(l);
}
