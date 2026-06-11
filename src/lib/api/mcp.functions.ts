import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getUser } from "../auth.server";
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

function generateRawKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return `siu_live_${b64}`;
}

export type ApiKeyRow = {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export const listApiKeys = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getUser();
  if (!user) throw new Error("Not authenticated");
  if (!isSupabaseConfigured()) return { items: [] as ApiKeyRow[] };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("mcp_api_keys")
    .select("id, name, created_at, last_used_at, revoked_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return { items: (data ?? []) as ApiKeyRow[] };
});

export const generateApiKey = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(1).max(64).default("Default") }))
  .handler(async ({ data }) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

    const raw = generateRawKey();
    const hash = await sha256hex(raw);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("mcp_api_keys").insert({
      user_id: user.id,
      name: data.name,
      key_hash: hash,
    });

    if (error) throw new Error(error.message);
    return { key: raw };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("mcp_api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
