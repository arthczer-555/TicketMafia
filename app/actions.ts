"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { isAuthenticated } from "@/lib/auth";
import type { TicketStatus } from "@/lib/slack/types";

const STATUSES: readonly TicketStatus[] = ["todo", "doing", "waiting", "done"];

export async function moveTicket(id: string, status: TicketStatus): Promise<void> {
  if (!(await isAuthenticated())) throw new Error("unauthenticated");
  if (!id || !STATUSES.includes(status)) return;

  const supabase = createServiceClient();
  const { error } = await supabase.from("tickets").update({ status }).eq("id", id);
  if (error) {
    console.error("moveTicket failed", error);
    return;
  }

  revalidatePath("/");
  revalidatePath(`/tickets/${id}`);
}
