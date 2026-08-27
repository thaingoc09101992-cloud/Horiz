-- "Đơn mới": orders an admin hasn't opened yet. opened_at is stamped the first
-- time an admin views the order (detail row or editor); null = still new.
alter table public.orders add column if not exists opened_at timestamptz;

comment on column public.orders.opened_at is
  'When an admin first opened the order (detail row or editor). Null = "Đơn mới" (chưa tiếp nhận).';

-- Backfill: orders already past the initial state count as seen. Leave current
-- pending-payment orders as "new" so they surface in the admin queue.
update public.orders set opened_at = created_at
where opened_at is null and status <> 'pending_payment';
