import { createServiceClient } from "@/lib/supabase/service";
import type { TicketCategory, TicketStatus } from "@/lib/slack/types";

export type TicketRow = {
  id: string;
  slack_channel_id: string;
  slack_channel_name: string | null;
  slack_ts: string;
  category: TicketCategory;
  title: string;
  body: string;
  slack_author_id: string | null;
  author_name: string | null;
  author_avatar: string | null;
  status: TicketStatus;
  owner: string | null;
  deadline: string | null;
  slack_permalink: string | null;
  created_at: string;
  updated_at: string;
};

export type AttachmentRow = {
  id: string;
  ticket_id: string;
  slack_file_id: string | null;
  url: string;
  name: string | null;
  mimetype: string | null;
};

export type CommentRow = {
  id: string;
  ticket_id: string;
  source: "slack" | "app";
  slack_ts: string | null;
  slack_user_id: string | null;
  author_name: string | null;
  author_avatar: string | null;
  body: string;
  created_at: string;
};

export async function listTickets(opts: {
  category?: TicketCategory | "all";
} = {}): Promise<TicketRow[]> {
  const supabase = createServiceClient();
  let query = supabase.from("tickets").select("*").order("created_at", { ascending: false });

  if (opts.category && opts.category !== "all") {
    query = query.eq("category", opts.category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("listTickets failed", error);
    return [];
  }
  return (data ?? []) as TicketRow[];
}

export async function getTicket(id: string): Promise<{
  ticket: TicketRow | null;
  attachments: AttachmentRow[];
  comments: CommentRow[];
}> {
  const supabase = createServiceClient();

  const [ticketRes, attRes, commentsRes] = await Promise.all([
    supabase.from("tickets").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("ticket_attachments")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("ticket_comments")
      .select("*")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    ticket: (ticketRes.data ?? null) as TicketRow | null,
    attachments: (attRes.data ?? []) as AttachmentRow[],
    comments: (commentsRes.data ?? []) as CommentRow[],
  };
}

export async function getAttachment(id: string): Promise<AttachmentRow | null> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("ticket_attachments").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as AttachmentRow | null;
}

export type OwnerRow = {
  id: string;
  name: string;
  created_at: string;
};

export async function listOwners(): Promise<OwnerRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("owners").select("*").order("name");
  if (error) {
    console.error("listOwners failed", error);
    return [];
  }
  return (data ?? []) as OwnerRow[];
}
