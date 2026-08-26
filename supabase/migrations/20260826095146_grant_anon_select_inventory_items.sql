-- An RLS policy alone isn't enough — Postgres also needs the table-level
-- GRANT before RLS even gets a chance to filter rows. inventory_items was
-- missing SELECT for the anon role entirely (only `authenticated` had it),
-- so anonymous shoppers got a flat "permission denied for table
-- inventory_items" regardless of the policy added in the sibling migration.
grant select on public.inventory_items to anon;
