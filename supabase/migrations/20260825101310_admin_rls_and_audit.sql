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

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','user_roles','member_status','categories','products','product_options',
    'option_values','product_variants','variant_option_values','media_assets',
    'collections','collection_products','inventory_items','inventory_movements',
    'inventory_reservations','orders','order_items','payments','shipments','refunds',
    'promotions','promotion_targets','coupon_codes','coupon_redemptions','price_history',
    'newsletter_subscribers','content_sections','audit_logs','daily_sales_metrics',
    'daily_inventory_snapshots'
  ] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format('drop policy if exists %I on public.%I', 'Admins manage ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      'Admins manage ' || table_name,
      table_name
    );
  end loop;
end $$;

grant usage, select on all sequences in schema public to authenticated;

create or replace function private.audit_admin_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity_id uuid;
begin
  if not private.is_admin() then
    return coalesce(new, old);
  end if;

  begin
    v_entity_id := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id')::uuid;
  exception when invalid_text_representation then
    v_entity_id := null;
  end;

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, before_data, after_data
  ) values (
    auth.uid(), lower(tg_op), tg_table_name, v_entity_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );

  return coalesce(new, old);
end;
$$;

revoke all on function private.audit_admin_change() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'products','product_variants','inventory_items','orders','promotions',
    'content_sections','member_status','user_roles'
  ] loop
    execute format('drop trigger if exists audit_admin_change on public.%I', table_name);
    execute format(
      'create trigger audit_admin_change after insert or update or delete on public.%I for each row execute function private.audit_admin_change()',
      table_name
    );
  end loop;
end $$;
