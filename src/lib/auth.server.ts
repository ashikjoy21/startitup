import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseAdmin } from "./supabase.server";

async function parseRequestCookies(): Promise<{ name: string; value: string }[]> {
  const { getRequest } = await import("@tanstack/react-start/server");
  const req = getRequest();
  const cookieStr = req.headers.get("cookie") ?? "";
  if (!cookieStr) return [];
  return cookieStr
    .split(";")
    .map((c: string) => {
      const i = c.indexOf("=");
      if (i < 0) return null;
      const name = c.slice(0, i).trim();
      if (!name) return null;
      try {
        return { name, value: decodeURIComponent(c.slice(i + 1).trim()) };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as { name: string; value: string }[];
}

export type PendingCookie = { name: string; value: string; options: CookieOptions };

export function createSupabaseSSRClient() {
  const pending: PendingCookie[] = [];

  const supabase = createServerClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: parseRequestCookies,
        setAll: (cookies) => {
          pending.push(...cookies);
        },
      },
    },
  );

  return { supabase, getPending: () => pending };
}

export async function getUser() {
  const { supabase } = createSupabaseSSRClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data as {
    id: string;
    stage: string | null;
    sector: string | null;
    funding_status: string | null;
  } | null;
}

export function serializeCookie(name: string, value: string, opts: CookieOptions): string {
  let str = `${name}=${encodeURIComponent(value)}`;
  if (opts.maxAge != null) str += `; Max-Age=${opts.maxAge}`;
  if (opts.expires) str += `; Expires=${opts.expires.toUTCString()}`;
  str += `; Path=${opts.path ?? "/"}`;
  if (opts.httpOnly) str += `; HttpOnly`;
  if (opts.secure) str += `; Secure`;
  if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;
  return str;
}
