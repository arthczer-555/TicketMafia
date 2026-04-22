"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { isAuthenticated } from "@/lib/auth";

async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) throw new Error("unauthenticated");
}

export async function addOwner(formData: FormData) {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim().toLowerCase();
  if (!name) return;
  if (name.length > 40) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("owners").insert({ name }).select().single();
  if (error && !error.message.includes("duplicate")) {
    console.error("addOwner failed", error);
  }
  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

export async function deleteOwner(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("owners").delete().eq("id", id);
  if (error) console.error("deleteOwner failed", error);

  revalidatePath("/settings");
  revalidatePath("/", "layout");
}
