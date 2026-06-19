"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteRound,
  upsertRound,
  type RoundInput,
} from "@/lib/rounds";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function assertAuthed() {
  // Server Actions are independently-invokable endpoints, so verify auth here
  // too (not just in the proxy / page). RLS is the final backstop.
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");
}

export async function saveRound(input: RoundInput) {
  await assertAuthed();
  await upsertRound(input);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/${input.slug}`);
}

export async function removeRound(slug: string) {
  await assertAuthed();
  await deleteRound(slug);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
