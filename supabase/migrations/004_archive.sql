-- Add an archive flag on tickets. NULL = active, timestamp = archived (and when).
-- Archived tickets disappear from the kanban and admin dashboard but remain in
-- the DB so we can browse / restore them from the /archive page.

alter table public.tickets
  add column if not exists archived_at timestamptz;

create index if not exists tickets_archived_idx
  on public.tickets (archived_at);
