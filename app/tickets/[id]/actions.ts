"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { isAuthenticated } from "@/lib/auth";

const STATUSES = ["todo", "doing", "waiting", "done"] as const;
type Status = (typeof STATUSES)[number];

function isStatus(v: unknown): v is Status {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) throw new Error("unauthenticated");
}

export async function updateTicket(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const status = formData.get("status");
  const ownerRaw = String(formData.get("owner") ?? "").trim();
  const deadlineRaw = String(formData.get("deadline") ?? "");
  const hasTitle = formData.has("title");
  const titleRaw = String(formData.get("title") ?? "").trim();

  const updates: Record<string, string | null> = {};

  if (isStatus(status)) updates.status = status;

  // Owner is now any text — managed via /settings, no enum constraint.
  if (ownerRaw === "") updates.owner = null;
  else if (ownerRaw.length <= 40) updates.owner = ownerRaw.toLowerCase();

  if (deadlineRaw === "") updates.deadline = null;
  else if (/^\d{4}-\d{2}-\d{2}$/.test(deadlineRaw)) updates.deadline = deadlineRaw;

  if (hasTitle && titleRaw.length > 0 && titleRaw.length <= 300) {
    updates.title = titleRaw;
  }

  if (Object.keys(updates).length === 0) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("tickets").update(updates).eq("id", id);
  if (error) {
    console.error("updateTicket failed", error);
    return;
  }

  revalidatePath(`/tickets/${id}`);
  revalidatePath("/");
}

export async function addComment(formData: FormData) {
  await requireAuth();

  const ticketId = String(formData.get("ticket_id") ?? "");
  const author = String(formData.get("author") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!ticketId || author.length === 0 || body.length === 0) return;
  if (author.length > 60) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("ticket_comments").insert({
    ticket_id: ticketId,
    source: "app",
    author_name: author,
    body,
  });

  if (error) {
    console.error("addComment failed", error);
    return;
  }

  revalidatePath(`/tickets/${ticketId}`);
}

export async function deleteTicket(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/");
  if (!id) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) {
    console.error("deleteTicket failed", error);
    return;
  }

  revalidatePath("/");
  redirect(redirectTo);
}

export async function deleteComment(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") ?? "");
  const ticketId = String(formData.get("ticket_id") ?? "");
  if (!id) return;

  const supabase = createServiceClient();
  // Only allow deleting in-app comments — never the Slack-sourced ones.
  const { error } = await supabase
    .from("ticket_comments")
    .delete()
    .eq("id", id)
    .eq("source", "app");

  if (error) {
    console.error("deleteComment failed", error);
    return;
  }

  if (ticketId) revalidatePath(`/tickets/${ticketId}`);
}
