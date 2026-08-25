alter table public.products add column source_key text;
create unique index products_source_key_unique on public.products(source_key) where source_key is not null;

create sequence if not exists private.order_number_seq;
revoke all on sequence private.order_number_seq from public, anon, authenticated;

create or replace function public.place_cod_order(
  p_phone text,
  p_shipping_address jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_order_id uuid;
  v_order_number text;
  v_subtotal bigint := 0;
  v_shipping_total bigint := 0;
  v_grand_total bigint := 0;
  v_item_count integer := 0;
  v_item record;
  v_variant record;
begin
  if v_user_id is null then
    raise exception 'Bạn cần đăng nhập để đặt hàng.' using errcode = '42501';
  end if;

  select u.email into v_email from auth.users u where u.id = v_user_id;
  if v_email is null then
    raise exception 'Không tìm thấy email tài khoản.' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.member_status ms
    where ms.user_id = v_user_id and ms.status = 'active'
  ) then
    raise exception 'Tài khoản hiện không thể đặt hàng.' using errcode = '42501';
  end if;

  if p_phone is null or length(trim(p_phone)) < 8 or length(trim(p_phone)) > 20 then
    raise exception 'Số điện thoại không hợp lệ.' using errcode = '22023';
  end if;

  if p_shipping_address is null
    or length(trim(coalesce(p_shipping_address->>'recipient', ''))) < 2
    or length(trim(coalesce(p_shipping_address->>'line1', ''))) < 3
    or length(trim(coalesce(p_shipping_address->>'province', ''))) < 2 then
    raise exception 'Địa chỉ giao hàng chưa đầy đủ.' using errcode = '22023';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Giỏ hàng không hợp lệ.' using errcode = '22023';
  end if;

  for v_item in
    select source_key, size, sum(quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as x(source_key text, size text, quantity integer)
    group by source_key, size
  loop
    if v_item.source_key is null or v_item.size is null or v_item.quantity < 1 or v_item.quantity > 10 then
      raise exception 'Sản phẩm hoặc số lượng không hợp lệ.' using errcode = '22023';
    end if;

    select
      pv.id as variant_id,
      pv.sku,
      pv.title as variant_name,
      pv.price_amount,
      pv.currency,
      p.name as product_name,
      ma.object_key as image_url,
      ii.on_hand,
      ii.reserved
    into v_variant
    from public.products p
    join public.product_variants pv on pv.product_id = p.id and pv.active
    join public.inventory_items ii on ii.variant_id = pv.id
    left join lateral (
      select m.object_key from public.media_assets m
      where m.product_id = p.id order by m.sort_order, m.created_at limit 1
    ) ma on true
    where p.source_key = v_item.source_key
      and p.status = 'published'
      and pv.title = v_item.size
    for update of ii;

    if not found then
      raise exception 'Sản phẩm hoặc kích thước không còn khả dụng.' using errcode = '22023';
    end if;
    if v_variant.on_hand - v_variant.reserved < v_item.quantity then
      raise exception 'Sản phẩm % size % không đủ tồn kho.', v_variant.product_name, v_item.size using errcode = '22023';
    end if;
    if v_variant.currency <> 'VND' then
      raise exception 'Đơn hàng COD hiện chỉ hỗ trợ VND.' using errcode = '22023';
    end if;

    v_item_count := v_item_count + v_item.quantity;
    v_subtotal := v_subtotal + (v_variant.price_amount * v_item.quantity);
  end loop;

  if v_item_count < 1 then
    raise exception 'Giỏ hàng không hợp lệ.' using errcode = '22023';
  end if;

  -- COD MVP currently has free shipping until a carrier/rate table is approved.
  v_shipping_total := 0;
  v_grand_total := v_subtotal + v_shipping_total;
  v_order_number := 'HZ-' || to_char(clock_timestamp(), 'YYYYMMDD') || '-' || lpad(nextval('private.order_number_seq')::text, 6, '0');

  insert into public.orders (
    order_number, user_id, email, phone, status, payment_status,
    fulfillment_status, currency, subtotal, shipping_total, grand_total,
    shipping_address, billing_address, placed_at
  ) values (
    v_order_number, v_user_id, v_email, trim(p_phone), 'pending_payment', 'pending',
    'unfulfilled', 'VND', v_subtotal, v_shipping_total, v_grand_total,
    p_shipping_address || jsonb_build_object('phone', trim(p_phone)),
    p_shipping_address || jsonb_build_object('phone', trim(p_phone)), now()
  ) returning id into v_order_id;

  for v_item in
    select source_key, size, sum(quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as x(source_key text, size text, quantity integer)
    group by source_key, size
  loop
    select
      pv.id as variant_id,
      pv.sku,
      pv.title as variant_name,
      pv.price_amount,
      p.name as product_name,
      ma.object_key as image_url
    into strict v_variant
    from public.products p
    join public.product_variants pv on pv.product_id = p.id and pv.active
    left join lateral (
      select m.object_key from public.media_assets m
      where m.product_id = p.id order by m.sort_order, m.created_at limit 1
    ) ma on true
    where p.source_key = v_item.source_key and pv.title = v_item.size;

    insert into public.order_items (
      order_id, variant_id, sku, product_name, variant_name,
      unit_price, quantity, line_total, image_url
    ) values (
      v_order_id, v_variant.variant_id, v_variant.sku, v_variant.product_name,
      v_variant.variant_name, v_variant.price_amount, v_item.quantity,
      v_variant.price_amount * v_item.quantity, v_variant.image_url
    );

    update public.inventory_items
    set reserved = reserved + v_item.quantity, updated_at = now()
    where variant_id = v_variant.variant_id;

    insert into public.inventory_reservations (
      variant_id, order_id, quantity, expires_at, status
    ) values (
      v_variant.variant_id, v_order_id, v_item.quantity, now() + interval '7 days', 'active'
    );

    insert into public.inventory_movements (
      variant_id, type, quantity, reference_type, reference_id, actor_id, reason
    ) values (
      v_variant.variant_id, 'reserve', v_item.quantity, 'order', v_order_id,
      v_user_id, 'COD checkout'
    );
  end loop;

  insert into public.payments (
    order_id, provider, status, amount, currency, idempotency_key, raw_reference
  ) values (
    v_order_id, 'cod', 'pending', v_grand_total, 'VND', 'cod:' || v_order_id::text,
    jsonb_build_object('method', 'cash_on_delivery')
  );

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'grand_total', v_grand_total,
    'currency', 'VND',
    'payment_method', 'cod'
  );
end;
$$;

revoke all on function public.place_cod_order(text, jsonb, jsonb) from public, anon;
grant execute on function public.place_cod_order(text, jsonb, jsonb) to authenticated;

comment on function public.place_cod_order(text, jsonb, jsonb) is
  'Authenticated per-user COD checkout. Validates member, locks inventory, and calculates prices server-side.';
