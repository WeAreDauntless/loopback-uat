import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Returns the signed-in Supabase user, or null. Uses getUser() (verified). */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Server-side guard for admin pages. The proxy also redirects, but per the
 * routing-middleware guidance (and CVE-2025-29927) the proxy must not be the
 * sole auth layer — verify again in the Server Component.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}
