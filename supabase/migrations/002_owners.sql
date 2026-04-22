-- Owners (devs) that can be assigned to a ticket. Managed via /settings.
-- Existing tickets' `owner` column stays a free text — when an owner is
-- removed from this table, past assignments are preserved as historical data.

create table public.owners (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

create index owners_name_idx on public.owners (name);

-- Seed with the two known users so existing tickets keep working.
insert into public.owners (name) values ('gaspard'), ('arthur')
  on conflict (name) do nothing;
