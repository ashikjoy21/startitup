const KSUM_LOGO = "/logos/kerala-startup-mission.svg";

const ORG_LOGO_OVERRIDES: Array<{ test: (org: string) => boolean; src: string }> = [
  {
    test: (org) => /kerala startup mission|\bksum\b|startupmission\.kerala/i.test(org),
    src: KSUM_LOGO,
  },
];

function isBrokenRemoteLogo(url: string): boolean {
  if (!url.startsWith("http")) return false;
  try {
    const { pathname } = new URL(url);
    return !/\.(png|jpe?g|svg|webp|gif|ico)$/i.test(pathname);
  } catch {
    return true;
  }
}

/** Resolve logo URL — fixes broken Supabase URLs and maps known orgs to bundled assets. */
export function resolveOpportunityLogo(org: string, logo: string | null | undefined): string {
  const orgOverride = ORG_LOGO_OVERRIDES.find((o) => o.test(org))?.src;
  if (orgOverride) return orgOverride;

  const value = (logo ?? "").trim();
  if (!value) return org.charAt(0).toUpperCase();
  if (value.startsWith("/")) return value;
  if (value.startsWith("http") && !isBrokenRemoteLogo(value)) return value;

  return org.charAt(0).toUpperCase();
}

export function isImageLogo(logo: string): boolean {
  return logo.startsWith("http") || logo.startsWith("/");
}
