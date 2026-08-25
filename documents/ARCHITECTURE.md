# Kiến trúc kỹ thuật

## 1. Kiến trúc mục tiêu

```text
Browser
  │
  ├── Cloudflare CDN / Pages (React assets, routing, cache)
  │        └── Worker/Functions (checkout, webhook, privileged APIs)
  │
  └── Supabase
           ├── Auth
           ├── Postgres + Data API + RLS
           ├── Storage
           └── Edge Functions (chỉ khi phù hợp hơn Worker)
```

## 2. Phân chia trách nhiệm

- React client: render UI, public catalogue reads, authenticated reads bị RLS bảo vệ.
- Cloudflare Worker: server-only secrets, checkout, payment webhook, signed operations, rate limits.
- Supabase Postgres: source of truth cho catalogue, inventory, order và authorization.
- Supabase Storage: media MVP; client public chỉ đọc asset được phép.

Không phân tán cùng một nghiệp vụ giữa Worker và Supabase Edge Function. Chọn một nơi sở hữu mỗi use case.

## 3. Cấu trúc repository đề xuất

```text
/
├── apps/storefront/src/{app,components,features,lib,routes,styles}
├── workers/api/src/{routes,services,webhooks}
├── packages/{ui,types,validation,config}
├── supabase/{migrations,seed.sql,tests}
├── scripts/catalog-import
├── public
├── documents
└── .github/workflows
```

Monorepo chưa bắt buộc dùng Turborepo ở MVP; npm/pnpm workspaces là đủ.

### Trạng thái triển khai Phase 1

- Đã dùng npm workspaces; frontend nằm tại `apps/storefront`.
- React Router dùng Declarative Mode; `/admin` được lazy-load thành bundle riêng.
- Supabase client được khởi tạo có điều kiện từ `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`; khi thiếu biến, UI chạy ở chế độ chưa kết nối và không giả lập quyền admin.
- Tailwind CSS 4 dùng Vite plugin; token/style nền nằm tại `apps/storefront/src/styles/global.css`.
- Quyết định được ghi tại `documents/decisions/ADR-20260824-frontend-monorepo-foundation.md`.

## 4. Luồng dữ liệu quan trọng

### Catalogue

Public query chỉ trả product `published`, variant active và media `rights_status='approved'`. Cache danh mục ngắn hạn; invalidation khi publish.

### Checkout

1. Client gửi cart ID, contact/address và lựa chọn ship.
2. Worker xác thực input, đọc lại SKU/giá/tồn từ DB.
3. Transaction reserve tồn và tạo order pending.
4. Worker tạo payment với idempotency key.
5. Webhook xác minh chữ ký, ghi event duy nhất, cập nhật payment/order.
6. Trang success đọc trạng thái từ server; query string không quyết định “paid”.

### Auth và admin authorization

1. Người dùng tự đăng ký qua Supabase Auth; profile được tạo với quyền customer mặc định.
2. Sau đăng nhập, ứng dụng lấy phiên và quyền đã xác minh; chỉ admin mới render link `Administrator`.
3. Route guard kiểm tra phiên để xử lý điều hướng, nhưng Worker/API và RLS tiếp tục kiểm tra permission cho từng thao tác.
4. Cấp/thu hồi role chỉ chạy qua server admin action, ghi audit log và buộc refresh token khi cần.
5. `/admin` tái sử dụng design system storefront nhưng được code-split thành bundle riêng.

## 5. State và caching

- Server state: query cache có key ổn định; invalidate sau mutation.
- UI state: component/local store; không copy toàn bộ server data vào global store.
- Cart: server cart là nguồn chính; local chỉ hỗ trợ guest/offline tạm thời.
- Asset fingerprinted: cache immutable; HTML/API cache ngắn và có revalidation.

## 6. Security baseline

- Chỉ publishable key ở browser; secret/service key nằm trong server secrets.
- CSP, HSTS, secure cookies, origin validation, rate limiting checkout/auth.
- Validate bằng schema ở mọi boundary; không tin price, role, user ID từ client.
- Webhook kiểm tra chữ ký trên raw body và chống replay/idempotency.
- Không dựa vào việc ẩn link `Administrator`; chống truy cập trái phép tại route, API, grants và RLS.
- Dependabot/Renovate, lockfile, secret scanning, branch protection.

## 7. Observability

- Cloudflare Web Analytics và Worker logs có request ID.
- Theo dõi error rate, checkout failure, webhook lag, out-of-stock conflict.
- Sentry hoặc tương đương cho frontend/server; scrub PII trước khi gửi.
