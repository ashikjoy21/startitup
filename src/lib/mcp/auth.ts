import { getSupabaseAdmin, isSupabaseConfigured } from "../supabase.server";

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type ValidatedKey = {
  id: string;
  userId: string;
};

export async function validateApiKey(
  raw: string | null,
): Promise<ValidatedKey | null> {
  if (!raw || !isSupabaseConfigured()) return null;
  if (!raw.startsWith("siu_live_")) return null;

  const hash = await sha256hex(raw);
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("mcp_api_keys")
    .select("id, user_id")
    .eq("key_hash", hash)
    .is("revoked_at", null)
    .maybeSingle();

  if (!data) return null;

  // update last_used_at without blocking the response
  supabase
    .from("mcp_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => {});

  return { id: data.id, userId: data.user_id as string };
}
