const ADMIN_KEY = "startitup:admin-secret";

export function getAdminSecret(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ADMIN_KEY) ?? "";
}

export function setAdminSecret(secret: string) {
  sessionStorage.setItem(ADMIN_KEY, secret);
}

export function clearAdminSecret() {
  sessionStorage.removeItem(ADMIN_KEY);
}
