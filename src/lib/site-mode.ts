export type SiteMode = "business" | "career";

export function modeForPathname(pathname: string): SiteMode {
  return ["/career", "/jobs", "/saved"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
    ? "career"
    : "business";
}

export function parseSiteModeCookie(cookieHeader: string | null | undefined): SiteMode | null {
  for (const part of cookieHeader?.split(";") ?? []) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== "siu_mode") continue;
    const value = part.slice(separator + 1).trim();
    return value === "business" || value === "career" ? value : null;
  }
  return null;
}

export function siteModeCookie(mode: SiteMode): string {
  return `siu_mode=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
