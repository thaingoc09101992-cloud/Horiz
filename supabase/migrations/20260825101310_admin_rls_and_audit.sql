create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.user_roles ur
    join public.member_status ms on ms.user_id = ur.user_id
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
      and ur.revoked_at is null
      and ms.status = 'active'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

grant select on table public.orders, public.inventory_items,
  public.product_variants, public.products to authenticated;

create policy "Admins read all orders"
on public.orders for select to authenticated
using ((select private.is_admin()));

create policy "Admins read all inventory"
on public.inventory_items for select to authenticated
using ((select private.is_admin()));

create policy "Admins read all product variants"
on public.product_variants for select to authenticated
using ((select private.is_admin()));

create policy "Admins read all products"
on public.products for select to authenticated
using ((select private.is_admin()));

grant update on table public.orders, public.inventory_items,
  public.member_status to authenticated;

create policy "Admins update orders"
on public.orders for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins update inventory"
on public.inventory_items for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins update member status"
on public.member_status for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create or replace function public.admin_members()
returns table (
  id uuid,
  email text,
  full_name text,
  phone text,
  created_at timestamptz,
  status public.member_state,
  role public.app_role
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    u.id,
    u.email::text,
    p.full_name,
    p.phone,
    u.created_at,
    ms.status,
    coalesce(ur.role, 'customer'::public.app_role)
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.member_status ms on ms.user_id = u.id
  left join public.user_roles ur
    on ur.user_id = u.id and ur.revoked_at is null
  where private.is_admin()
  order by u.created_at desc;
$$;

revoke all on function public.admin_members() from public, anon;
grant execute on function public.admin_members() to authenticated;
