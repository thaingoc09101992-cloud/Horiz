-- The storefront's product detail page reads on_hand/reserved directly
-- (client-side, anon key) to show per-size stock counts ("Còn N sản phẩm"
-- / "Hết"). inventory_items only ever had a SELECT policy for admins, so
-- every non-admin visitor's query got zero rows back and every size showed
-- as sold out — even though checkout itself worked fine, since the COD
-- checkout RPCs run as SECURITY DEFINER and bypass RLS entirely.
create policy "Public can read inventory for published variants" on public.inventory_items
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = inventory_items.variant_id
      and pv.active
      and p.status = 'published'
  )
);
