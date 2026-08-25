create extension if not exists pgcrypto with schema extensions;

create type public.product_state as enum ('draft', 'published', 'archived');
create type public.cart_state as enum ('active', 'converted', 'abandoned', 'expired');
create type public.order_state as enum ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded');
create type public.payment_state as enum ('pending', 'authorized', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded');
create type public.fulfillment_state as enum ('unfulfilled', 'processing', 'partially_shipped', 'shipped', 'delivered', 'cancelled');
create type public.reservation_state as enum ('active', 'released', 'converted', 'expired');
create type public.promotion_state as enum ('draft', 'scheduled', 'active', 'paused', 'expired');
create type public.discount_kind as enum ('percentage', 'fixed_amount');
create type public.target_kind as enum ('all', 'category', 'collection', 'product', 'variant');

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient text not null check (length(trim(recipient)) > 0),
  phone text not null check (length(trim(phone)) > 0),
  line1 text not null check (length(trim(line1)) > 0),
  line2 text,
  ward text,
  district text,
  province text not null,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index addresses_one_default_per_user_idx on public.addresses(user_id) where is_default;
create index addresses_user_id_idx on public.addresses(user_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique check (slug = lower(slug)),
  audience text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique check (slug = lower(slug)),
  subtitle text,
  description text,
  status public.product_state not null default 'draft',
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_status_idx on public.products(category_id, status);
create index products_published_idx on public.products(featured, updated_at desc) where status = 'published';

create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  unique(product_id, name)
);

create table public.option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  value text not null,
  swatch_hex text check (swatch_hex is null or swatch_hex ~ '^#[0-9A-Fa-f]{6}$'),
  position integer not null default 0,
  unique(option_id, value)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  title text not null,
  price_amount bigint not null check (price_amount >= 0),
  compare_at_amount bigint check (compare_at_amount is null or compare_at_amount > price_amount),
  currency text not null default 'VND' check (currency ~ '^[A-Z]{3}$'),
  active boolean not null default true,
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_variants_product_active_price_idx on public.product_variants(product_id, active, price_amount);

create table public.variant_option_values (
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  option_value_id uuid not null references public.option_values(id) on delete cascade,
  primary key (variant_id, option_value_id)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  provider text not null default 'supabase',
  object_key text not null,
  alt_text text not null default '',
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sort_order integer not null default 0,
  rights_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  unique(provider, object_key)
);

create index media_assets_product_sort_idx on public.media_assets(product_id, sort_order);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug = lower(slug)),
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  position integer not null default 0,
  primary key(collection_id, product_id)
);

create index collection_products_position_idx on public.collection_products(collection_id, position);

create table public.inventory_items (
  variant_id uuid primary key references public.product_variants(id) on delete cascade,
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= on_hand),
  reorder_level integer not null default 0 check (reorder_level >= 0),
  unit_cost bigint check (unit_cost is null or unit_cost >= 0),
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id bigint generated by default as identity primary key,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  type text not null check (type in ('receive', 'reserve', 'release', 'sale', 'return', 'adjustment', 'damage')),
  quantity integer not null check (quantity <> 0),
  reference_type text,
  reference_id uuid,
  actor_id uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create index inventory_movements_variant_created_idx on public.inventory_movements(variant_id, created_at desc);
create index inventory_movements_created_type_idx on public.inventory_movements(created_at desc, type);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_token_hash text,
  status public.cart_state not null default 'active',
  currency text not null default 'VND' check (currency ~ '^[A-Z]{3}$'),
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or guest_token_hash is not null)
);

create index carts_user_status_idx on public.carts(user_id, status) where user_id is not null;
create unique index carts_guest_token_hash_idx on public.carts(guest_token_hash) where guest_token_hash is not null;

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, variant_id)
);

create table public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  cart_id uuid references public.carts(id) on delete cascade,
  order_id uuid,
  quantity integer not null check (quantity > 0),
  expires_at timestamptz not null,
  status public.reservation_state not null default 'active',
  created_at timestamptz not null default now(),
  check (cart_id is not null or order_id is not null)
);

create index inventory_reservations_active_expiry_idx on public.inventory_reservations(expires_at, variant_id) where status = 'active';

create table public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  phone text,
  status public.order_state not null default 'pending_payment',
  payment_status public.payment_state not null default 'pending',
  fulfillment_status public.fulfillment_state not null default 'unfulfilled',
  currency text not null default 'VND' check (currency ~ '^[A-Z]{3}$'),
  subtotal bigint not null check (subtotal >= 0),
  discount_total bigint not null default 0 check (discount_total >= 0),
  shipping_total bigint not null default 0 check (shipping_total >= 0),
  tax_total bigint not null default 0 check (tax_total >= 0),
  grand_total bigint not null check (grand_total >= 0),
  shipping_address jsonb not null,
  billing_address jsonb,
  placed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1
);

alter table public.inventory_reservations add constraint inventory_reservations_order_id_fkey foreign key(order_id) references public.orders(id) on delete cascade;
create index orders_user_placed_idx on public.orders(user_id, placed_at desc);
create index orders_dashboard_idx on public.orders(placed_at desc, payment_status, status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  sku text not null,
  product_name text not null,
  variant_name text not null,
  unit_price bigint not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  discount_total bigint not null default 0 check (discount_total >= 0),
  line_total bigint not null check (line_total >= 0),
  image_url text
);

create index order_items_order_variant_idx on public.order_items(order_id, variant_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null,
  provider_payment_id text,
  status public.payment_state not null default 'pending',
  amount bigint not null check (amount >= 0),
  currency text not null default 'VND' check (currency ~ '^[A-Z]{3}$'),
  idempotency_key text not null unique,
  raw_reference jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_payment_id)
);

create table public.payment_events (
  id bigint generated by default as identity primary key,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload_hash text not null,
  processed_at timestamptz,
  status text not null default 'received' check (status in ('received', 'processed', 'ignored', 'failed')),
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  carrier text,
  tracking_number text,
  status text not null default 'pending',
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid not null references public.payments(id) on delete restrict,
  amount bigint not null check (amount > 0),
  reason text not null,
  status text not null default 'pending',
  provider_refund_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discount_type public.discount_kind not null,
  discount_value bigint not null check (discount_value > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  status public.promotion_state not null default 'draft',
  stackable boolean not null default false,
  priority integer not null default 0,
  min_order_amount bigint not null default 0 check (min_order_amount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (discount_type <> 'percentage' or discount_value <= 10000)
);

create index promotions_schedule_idx on public.promotions(status, starts_at, ends_at);

create table public.promotion_targets (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  target_type public.target_kind not null,
  target_id uuid,
  check ((target_type = 'all' and target_id is null) or (target_type <> 'all' and target_id is not null))
);

create unique index promotion_targets_specific_unique on public.promotion_targets(promotion_id, target_type, target_id) where target_id is not null;
create unique index promotion_targets_all_unique on public.promotion_targets(promotion_id) where target_type = 'all';

create table public.coupon_codes (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  code text not null unique check (code = upper(code)),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  per_member_limit integer check (per_member_limit is null or per_member_limit > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupon_codes(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  amount bigint not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique(coupon_id, order_id)
);

create table public.price_history (
  id bigint generated by default as identity primary key,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  old_price bigint check (old_price is null or old_price >= 0),
  new_price bigint not null check (new_price >= 0),
  effective_at timestamptz not null default now(),
  changed_by uuid references auth.users(id) on delete set null,
  reason text
);

create index price_history_variant_effective_idx on public.price_history(variant_id, effective_at desc);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending' check (status in ('pending', 'subscribed', 'unsubscribed')),
  consented_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.content_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index content_sections_page_active_idx on public.content_sections(page_key, active, position);

create table public.audit_logs (
  id bigint generated by default as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_created_idx on public.audit_logs(entity_type, entity_id, created_at desc);
create index audit_logs_actor_created_idx on public.audit_logs(actor_id, created_at desc);

create table public.slug_redirects (
  id bigint generated by default as identity primary key,
  entity_type text not null check (entity_type in ('product', 'category', 'collection')),
  old_slug text not null,
  new_slug text not null,
  created_at timestamptz not null default now(),
  unique(entity_type, old_slug)
);

create table public.daily_sales_metrics (
  metric_date date primary key,
  gross_revenue bigint not null default 0,
  discounts bigint not null default 0,
  refunds bigint not null default 0,
  net_revenue bigint not null default 0,
  paid_orders integer not null default 0,
  units_sold integer not null default 0,
  rebuilt_at timestamptz not null default now()
);

create table public.daily_inventory_snapshots (
  snapshot_date date not null,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  on_hand integer not null,
  reserved integer not null,
  available integer not null,
  inventory_value bigint,
  primary key(snapshot_date, variant_id),
  check (on_hand >= 0 and reserved >= 0 and available = on_hand - reserved)
);

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'addresses','categories','products','product_options','option_values','product_variants',
    'variant_option_values','media_assets','collections','collection_products','inventory_items',
    'inventory_movements','inventory_reservations','carts','cart_items','wishlists','orders',
    'order_items','payments','payment_events','shipments','refunds','promotions','promotion_targets',
    'coupon_codes','coupon_redemptions','price_history','newsletter_subscribers','content_sections',
    'audit_logs','slug_redirects','daily_sales_metrics','daily_inventory_snapshots'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
  end loop;
end $$;

do $$
declare table_name text;
begin
  foreach table_name in array array['addresses','categories','products','product_variants','collections','carts','cart_items','orders','payments','shipments','refunds','promotions','content_sections'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name);
  end loop;
end $$;

grant select on public.categories, public.products, public.product_options, public.option_values,
  public.product_variants, public.variant_option_values, public.media_assets, public.collections,
  public.collection_products, public.content_sections, public.slug_redirects to anon, authenticated;

create policy "Public can read active categories" on public.categories for select to anon, authenticated using (active);
create policy "Public can read published products" on public.products for select to anon, authenticated using (status = 'published');
create policy "Public can read published product options" on public.product_options for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy "Public can read published option values" on public.option_values for select to anon, authenticated
  using (exists (select 1 from public.product_options po join public.products p on p.id = po.product_id where po.id = option_id and p.status = 'published'));
create policy "Public can read active published variants" on public.product_variants for select to anon, authenticated
  using (active and exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy "Public can read published variant options" on public.variant_option_values for select to anon, authenticated
  using (exists (select 1 from public.product_variants v join public.products p on p.id = v.product_id where v.id = variant_id and v.active and p.status = 'published'));
create policy "Public can read published media" on public.media_assets for select to anon, authenticated
  using (rights_status = 'approved' and exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy "Public can read active collections" on public.collections for select to anon, authenticated using (active);
create policy "Public can read active collection products" on public.collection_products for select to anon, authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id and c.active)
    and exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy "Public can read active content" on public.content_sections for select to anon, authenticated
  using (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy "Public can read slug redirects" on public.slug_redirects for select to anon, authenticated using (true);

grant select, insert, update, delete on public.addresses, public.wishlists to authenticated;
create policy "Members manage own addresses" on public.addresses for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Members manage own wishlist" on public.wishlists for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select on public.orders, public.order_items, public.payments, public.shipments, public.refunds to authenticated;
create policy "Members read own orders" on public.orders for select to authenticated using ((select auth.uid()) = user_id);
create policy "Members read own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "Members read own payments" on public.payments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "Members read own shipments" on public.shipments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
create policy "Members read own refunds" on public.refunds for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));

grant insert on public.newsletter_subscribers to anon, authenticated;
create policy "Visitors can subscribe newsletter" on public.newsletter_subscribers for insert to anon, authenticated
  with check (status = 'pending' and consented_at is not null);

grant usage, select on all sequences in schema public to authenticated;

comment on table public.payment_events is 'Webhook idempotency ledger; server-only access.';
comment on table public.audit_logs is 'Append-only audit trail; server/admin API access only.';
comment on column public.promotions.discount_value is 'Percentage uses basis points (10000 = 100%); fixed amount uses currency minor unit.';
