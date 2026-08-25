# Thiết kế cơ sở dữ liệu Supabase

## 1. Nguyên tắc

- UUID nội bộ; timestamp `timestamptz`; tiền `bigint`; mã/slug có unique index.
- Catalogue công khai chỉ đọc; mọi mutation quản trị đi qua quyền admin/server.
- Snapshot dữ liệu tại thời điểm mua, không join catalogue để tái tạo đơn cũ.
- RLS bật trên mọi bảng trong schema exposed; grants và policies đều theo least privilege.

## 2. Các bảng

### Identity

- `profiles(id PK/FK auth.users, full_name, phone, created_at, updated_at)`
- `addresses(id, user_id, recipient, phone, line1, line2, ward, district, province, postal_code, is_default)`
- `user_roles(user_id, role, granted_by, granted_at, revoked_at)` — role: customer/staff/admin; unique role đang hiệu lực; chỉ API đặc quyền sửa.
- `member_status(user_id, status, reason, updated_by, updated_at)` — active/blocked; không trộn trạng thái với role.

### Catalogue

- `categories(id, parent_id, name, slug, audience, sort_order, active)`
- `products(id, category_id, name, slug, subtitle, description, status, featured, seo_title, seo_description)`
- `product_options(id, product_id, name, position)`
- `option_values(id, option_id, value, swatch_hex, position)`
- `product_variants(id, product_id, sku, title, price_amount, compare_at_amount, currency, active, weight_grams)`
- `variant_option_values(variant_id, option_value_id)`
- `media_assets(id, product_id, variant_id nullable, provider, object_key, alt_text, width, height, sort_order, rights_status)`
- `collections(id, name, slug, description, active)`
- `collection_products(collection_id, product_id, position)`

### Inventory

- `inventory_items(variant_id PK, on_hand, reserved, reorder_level, updated_at)`
- `inventory_movements(id, variant_id, type, quantity, reference_type, reference_id, actor_id, created_at)`
- `inventory_reservations(id, variant_id, cart_id/order_id, quantity, expires_at, status)`

### Cart và wishlist

- `carts(id, user_id nullable, guest_token_hash nullable, status, currency, expires_at)`
- `cart_items(id, cart_id, variant_id, quantity, created_at, updated_at)`; unique `(cart_id, variant_id)`
- `wishlists(user_id, product_id, created_at)`; PK `(user_id, product_id)`

### Order/payment

- `orders(id, order_number, user_id nullable, email, status, payment_status, fulfillment_status, currency, subtotal, discount_total, shipping_total, tax_total, grand_total, shipping_address jsonb, billing_address jsonb, placed_at)`
- `order_items(id, order_id, variant_id nullable, sku, product_name, variant_name, unit_price, quantity, discount_total, line_total, image_url)`
- `payments(id, order_id, provider, provider_payment_id, status, amount, currency, idempotency_key, raw_reference)`
- `payment_events(id, provider, provider_event_id, event_type, payload_hash, processed_at, status)`
- `shipments(id, order_id, carrier, tracking_number, status, shipped_at, delivered_at)`
- `refunds(id, order_id, payment_id, amount, reason, status, provider_refund_id)`

### Content/operations

- `promotions(id, name, discount_type, discount_value, starts_at, ends_at, status, stackable, priority, min_order_amount, usage_limit, created_by)`
- `promotion_targets(promotion_id, target_type, target_id)`; target là product/category/collection/variant hoặc all.
- `coupon_codes(id, promotion_id, code, usage_limit, per_member_limit, active)` và `coupon_redemptions(coupon_id, order_id, user_id, amount)`
- `price_history(id, variant_id, old_price, new_price, effective_at, changed_by, reason)`
- `newsletter_subscribers`
- `content_sections(id, page_key, type, payload jsonb, position, active, starts_at, ends_at)`
- `audit_logs(id, actor_id, action, entity_type, entity_id, before_data, after_data, created_at)`
- `slug_redirects(id, entity_type, old_slug, new_slug)`

### Analytics/dashboard

- Ưu tiên tính KPI từ `orders`, `order_items`, `payments`, `refunds`, `inventory_items` và `inventory_movements` — không tạo một nguồn sự thật thứ hai.
- View tổng hợp phải dùng `security_invoker = true` hoặc đặt trong schema private và chỉ gọi qua API admin.
- Có thể tạo `daily_sales_metrics(metric_date, gross_revenue, discounts, refunds, net_revenue, paid_orders, units_sold)` khi dữ liệu đủ lớn; job rebuild phải idempotent.
- Snapshot tồn kho theo ngày: `daily_inventory_snapshots(snapshot_date, variant_id, on_hand, reserved, available, inventory_value)` để tính xu hướng và hàng tồn chậm.
- `inventory_items` cần `unit_cost` nếu dashboard hiển thị giá trị tồn; nếu chưa có giá vốn, phải ghi rõ đang dùng giá bán và không gọi đó là giá trị vốn.

## 3. Quan hệ chính

```text
category 1─n product 1─n variant 1─1 inventory_item
product 1─n media_asset
product n─n collection
cart 1─n cart_item n─1 variant
order 1─n order_item
order 1─n payment / shipment / refund
auth.users 1─1 profile; 1─n address/order/cart
```

## 4. RLS matrix tối thiểu

| Dữ liệu | anon | customer | staff/admin |
|---|---|---|---|
| Published catalogue/content | SELECT | SELECT | CRUD theo role |
| Profile/address | — | own rows | support scope |
| Cart | guest token qua server | own rows | support scope |
| Orders/items | tạo qua server | own rows SELECT | nghiệp vụ theo role |
| Inventory movement/payment event/audit | — | — | server/admin |
| Roles/member status | — | own safe profile only | admin API theo permission |
| Promotion/price history | active public projection | active public projection | CRUD theo permission |

Policies `UPDATE` phải có cả `USING` và `WITH CHECK`; UPDATE cũng cần SELECT policy phù hợp. Không dùng `raw_user_meta_data` để phân quyền. View exposed phải dùng `security_invoker = true` hoặc bị revoke khỏi client roles.

Role được đưa vào JWT bằng Custom Access Token Hook hoặc đọc qua API server. Claim chỉ dùng để hỗ trợ UI/RLS, không được client tự ghi. Khi đổi role cần refresh token; thao tác đặc biệt nhạy cảm nên kiểm tra role hiện hành từ nguồn server để tránh claim cũ.

## 5. Index quan trọng

- Unique: `products.slug`, `product_variants.sku`, `orders.order_number`, `payment_events(provider, provider_event_id)`.
- Unique/lookup: role hiệu lực theo user, `coupon_codes.code`, promotion active theo `starts_at/ends_at`, `price_history(variant_id, effective_at desc)`.
- Search/filter: product status/category, variant product/active/price, collection position.
- Dashboard: orders `(placed_at, payment_status, status)`, order_items `(order_id, variant_id)`, movements `(created_at, variant_id, type)` và snapshots `(snapshot_date, variant_id)`.
- Ownership: addresses/user_id, orders/user_id + placed_at desc, carts/user_id + status.
- Partial index cho product `status='published'` và reservation còn hiệu lực.

## 6. Migration và kiểm thử

- Tạo migration bằng Supabase CLI, commit cùng code; không sửa production thủ công.
- Seed chỉ chứa dữ liệu demo không nhạy cảm.
- Test RLS cho anon, customer A, customer B, staff và admin.
- Chạy database advisors trước release; kiểm tra grants riêng, RLS riêng.

### Trạng thái triển khai Supabase

- Migration nền tảng: `supabase/migrations/20260824143130_foundation_auth_roles.sql`.
- Đã tạo `profiles`, `user_roles`, `member_status`, enum role/status, ownership RLS và auth trigger trong schema `private`.
- Tài khoản mới được tạo profile, role `customer` và trạng thái `active`; client không có quyền INSERT/UPDATE role.
- pgTAP contract nằm tại `supabase/tests/001_foundation_rls.sql`.
- Migration commerce đầy đủ: `supabase/migrations/20260825090945_full_commerce_schema.sql`; migration index khóa ngoại: `supabase/migrations/20260825092500_add_foreign_key_indexes.sql`.
- Đã áp dụng 3 migration lên project Supabase `HORIZ` (`tlxtdtfrqmaxmzazwhhq`) ngày 25/08/2026; 36/36 bảng trong schema `public` bật RLS.
- Catalogue/content chỉ đọc công khai khi active/published; dữ liệu thành viên chỉ truy cập theo ownership; bảng thanh toán, tồn kho, role và audit dành cho server/admin API.
- TypeScript types được sinh từ database tại `apps/storefront/src/types/database.ts`; pgTAP commerce contract nằm tại `supabase/tests/002_full_commerce_schema.sql`.
- COD checkout được triển khai bởi `public.place_cod_order`: chỉ role `authenticated` được gọi; hàm kiểm tra `auth.uid()`, trạng thái thành viên, input, giá và tồn kho, khóa inventory trong transaction rồi tạo order/payment/reservation/movement.
- Catalogue prototype đã nhập 57 sản phẩm, 398 variant và 398 inventory item. Ảnh giữ `rights_status=unverified`, không được public media policy trả qua Data API.
- Security advisor có cảnh báo chủ ý cho `place_cod_order` vì đây là per-user privileged RPC; `anon` bị revoke, input và ownership được kiểm tra trong hàm. Các INFO `rls_enabled_no_policy` là bảng server-only; `unused_index` là bình thường khi chưa có traffic thực.
- Máy phát triển chưa có Supabase CLI/Docker nên chưa chạy pgTAP local; schema production đã được kiểm tra bằng catalog query và Supabase advisors.
