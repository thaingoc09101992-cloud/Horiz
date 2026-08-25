grant select on table public.order_items to authenticated;

drop policy if exists "Admins read all order items" on public.order_items;
create policy "Admins read all order items"
on public.order_items for select to authenticated
using ((select private.is_admin()));
