-- Add 'super_admin' to the ticket_category enum so we can ingest messages
-- from the #super-admin-dashboards Slack channel as a third category.
--
-- Postgres allows ALTER TYPE ADD VALUE on enums, but it cannot run inside a
-- transaction block on older versions. The Supabase SQL editor runs each
-- statement in its own transaction, which works fine.

alter type ticket_category add value if not exists 'super_admin';
