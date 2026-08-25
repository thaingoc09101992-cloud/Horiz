import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const products = JSON.parse(readFileSync(join(root, 'apps/storefront/src/data/catalogue.generated.json'), 'utf8'))
const outputPath = join(root, 'supabase/migrations/20260825094100_seed_prototype_catalogue.sql')

const sizesFor = (category, audience) => {
  if (category === 'Shoes') return audience === 'Toddler'
    ? ['22', '23', '24', '25', '26', '27', '28']
    : ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
  if (category === 'Socks') return ['S', 'M', 'L']
  return ['XS', 'S', 'M', 'L', 'XL']
}

const payload = products.map((product) => ({
  source_key: product.id,
  slug: product.slug,
  name: product.name,
  audience: product.audience,
  category: product.category,
  price: product.price,
  image: product.image,
  sizes: sizesFor(product.category, product.audience),
}))

const json = JSON.stringify(payload).replaceAll("'", "''")
const sql = `-- Generated from apps/storefront/src/data/catalogue.generated.json.
-- Prototype assets remain rights_status=unverified and are not exposed by the public media RLS policy.
do $$
declare
  item jsonb;
  size_value text;
  category_uuid uuid;
  product_uuid uuid;
  option_uuid uuid;
  value_uuid uuid;
  variant_uuid uuid;
begin
  for item in select value from jsonb_array_elements('${json}'::jsonb)
  loop
    insert into public.categories(name, slug, audience, active)
    values (
      item->>'category',
      lower(regexp_replace((item->>'audience') || '-' || (item->>'category'), '[^a-zA-Z0-9]+', '-', 'g')),
      item->>'audience',
      true
    )
    on conflict (slug) do update set name = excluded.name, audience = excluded.audience, active = true
    returning id into category_uuid;

    insert into public.products(category_id, source_key, name, slug, subtitle, description, status)
    values (
      category_uuid,
      item->>'source_key',
      item->>'name',
      item->>'slug',
      (item->>'audience') || ' · ' || (item->>'category'),
      'Sản phẩm catalogue prototype HORIZ.',
      'published'
    )
    on conflict (slug) do update set
      category_id = excluded.category_id,
      source_key = excluded.source_key,
      name = excluded.name,
      subtitle = excluded.subtitle,
      status = 'published',
      updated_at = now()
    returning id into product_uuid;

    insert into public.media_assets(product_id, provider, object_key, alt_text, sort_order, rights_status)
    values (product_uuid, 'storefront-public', item->>'image', item->>'name', 0, 'unverified')
    on conflict (provider, object_key) do update set product_id = excluded.product_id, alt_text = excluded.alt_text;

    insert into public.product_options(product_id, name, position)
    values (product_uuid, 'Kích thước', 0)
    on conflict (product_id, name) do update set position = excluded.position
    returning id into option_uuid;

    for size_value in select jsonb_array_elements_text(item->'sizes')
    loop
      insert into public.option_values(option_id, value, position)
      values (option_uuid, size_value, 0)
      on conflict (option_id, value) do update set value = excluded.value
      returning id into value_uuid;

      insert into public.product_variants(product_id, sku, title, price_amount, currency, active)
      values (
        product_uuid,
        upper(regexp_replace(item->>'source_key', '[^a-zA-Z0-9]+', '-', 'g')) || '-' || size_value,
        size_value,
        (item->>'price')::bigint,
        'VND',
        true
      )
      on conflict (sku) do update set
        price_amount = excluded.price_amount,
        active = true,
        updated_at = now()
      returning id into variant_uuid;

      insert into public.variant_option_values(variant_id, option_value_id)
      values (variant_uuid, value_uuid)
      on conflict do nothing;

      insert into public.inventory_items(variant_id, on_hand, reserved, reorder_level)
      values (variant_uuid, 100, 0, 10)
      on conflict (variant_id) do update set
        on_hand = greatest(public.inventory_items.on_hand, public.inventory_items.reserved),
        reorder_level = excluded.reorder_level,
        updated_at = now();
    end loop;
  end loop;
end $$;
`

writeFileSync(outputPath, sql)
console.log(`Generated ${outputPath} for ${products.length} products.`)
