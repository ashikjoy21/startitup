export function profileMatchFingerprint(
  profile: {
    sector?: string | null;
    stage?: string | null;
    location?: string | null;
    dpiit_recognized?: boolean;
    women_led?: boolean;
    student_led?: boolean;
  } | null,
): string {
  return [
    profile?.sector ?? "",
    profile?.stage ?? "",
    profile?.location ?? "",
    profile?.dpiit_recognized ? "1" : "0",
    profile?.women_led ? "1" : "0",
    profile?.student_led ? "1" : "0",
  ].join("|");
}

export function clearDismissedRecommendations(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("siu_dismissed_actions");
  } catch {
    // localStorage unavailable
  }
}

/** Drop stale dismissals when profile inputs that drive matching change. */
export function syncDismissedWithProfile(fingerprint: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = "siu_profile_fingerprint";
    const prev = localStorage.getItem(key);
    if (prev !== fingerprint) {
      localStorage.removeItem("siu_dismissed_actions");
      localStorage.setItem(key, fingerprint);
    }
  } catch {
    // localStorage unavailable
  }
}
