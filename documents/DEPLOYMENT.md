# GitHub và triển khai Cloudflare

## 1. Môi trường

| Môi trường | Nhánh | Supabase | Cloudflare |
|---|---|---|---|
| Local | feature/* | local/dev | local dev |
| Preview | pull request | staging/branch | preview URL |
| Production | main | production | custom domain |

Không để preview trỏ vào database production có quyền ghi.

## 2. GitHub workflow

- Feature branch → PR → lint/typecheck/unit/build → preview → review → merge.
- `main` được bảo vệ; cấm push trực tiếp và bắt buộc checks.
- Migration review cùng PR; forward-only, có kế hoạch rollback/restore.
- Git LFS hoặc object storage cho asset nguồn lớn; tránh đưa thêm binary nặng vào Git history.

## 3. Cloudflare

Project này deploy qua **Workers Builds** (không phải Pages cổ điển) — build command chạy `npm run build` ở gốc repo như bình thường, nhưng bước deploy chạy `npx wrangler deploy`. Repo là npm workspaces monorepo (`apps/*`, `packages/*`, `workers/*`), nên cả 2 bước đều có thể tự dò-nhầm ở root repo và báo lỗi "application detection logic has been run in the root of a workspace":

- **Dashboard:** set **Root directory = `apps/storefront`** khi tạo project (không để trống/`/`).
- **Bắt buộc phải có** [`apps/storefront/wrangler.jsonc`](../apps/storefront/wrangler.jsonc) — nếu không, `wrangler deploy` không biết deploy gì và tự dò ở root repo, lỗi y hệt bước build dù Root directory đã set đúng. File này khai báo `assets.directory: "./dist"` + `not_found_handling: "single-page-application"` (tương đương `_redirects` cho SPA), không có `main` vì không có Worker script nào chạy server-side.
- `name` trong `wrangler.jsonc` **phải khớp chính xác** tên project Workers đã tạo trên dashboard — lệch tên sẽ deploy nhầm/tạo Worker mới.
- Build command vẫn để `npm run build` (chạy từ gốc repo, ra `apps/storefront/dist`) — không cần đổi thành build riêng cho `apps/storefront` dù Root directory đã trỏ vào đó.
- `npm run build` **không** chạy lại `scripts/build-sitemap.mjs` mỗi lần deploy. `sitemap.xml` là file tĩnh đã commit sẵn — nhớ chạy `node scripts/build-sitemap.mjs` ở local rồi commit lại mỗi khi catalogue đổi.
- **Không dùng `public/_redirects`** cho SPA fallback (đã xoá) — một rule kiểu `/* /index.html 200` bị API upload asset của Cloudflare từ chối vì báo nhầm "infinite loop" ([cloudflare/workers-sdk#11824](https://github.com/cloudflare/workers-sdk/issues/11824)), trong khi `not_found_handling` trong `wrangler.jsonc` đã lo phần này rồi nên file đó chỉ thừa và gây lỗi. Nếu cần rule redirect thật (không phải SPA fallback) thì thêm `public/_redirects` lại nhưng đừng đụng route `/*`. `_headers` (security/cache headers) vẫn giữ nguyên ở `apps/storefront/public/_headers`, Workers Assets đọc y hệt Pages, không bị ảnh hưởng.
- Secrets đặt trong Cloudflare dashboard/secret store, không dùng biến `VITE_*` cho secret.
- Custom domain, TLS, cache rules, compression và security headers.
- Production deploy chỉ từ `main`; preview từ PR.

Trước khi triển khai thực tế phải đối chiếu cấu hình và giới hạn hiện hành tại [Cloudflare Pages docs](https://developers.cloudflare.com/pages/) và [Cloudflare changelog](https://developers.cloudflare.com/changelog/).

## 4. Supabase

- Tách project staging/production hoặc dùng branching nếu gói dịch vụ phù hợp.
- Migration chạy bằng CI có approval cho production.
- Bật RLS, kiểm tra grants, Auth redirect URLs, email templates, rate limits và backup.
- Storage upload qua API; không sửa bảng `storage` trực tiếp.
- Đọc [Supabase changelog](https://supabase.com/changelog) trước thay đổi dependency/schema quan trọng.

## 5. Biến môi trường

Frontend public: Supabase URL và publishable key. Server only: Supabase secret key, payment secret/webhook secret, email provider secret. Mỗi môi trường dùng credential riêng và có quy trình rotate.

File mẫu local nằm tại `apps/storefront/.env.example`. Chỉ biến bắt đầu bằng `VITE_` mới đi vào browser và vì vậy tuyệt đối không chứa secret.

## 6. Release checklist

- CI xanh; E2E purchase path xanh trên preview.
- Migration dry-run/backup; RLS tests và advisors không có lỗi nghiêm trọng.
- Kiểm tra responsive, dark/light, full screen, accessibility và Core Web Vitals.
- Kiểm tra sitemap/robots/canonical/schema markup.
- Payment test, webhook replay, email xác nhận và inventory rollback.
- Xác nhận asset production có `rights_status=approved`.
- Có người phụ trách rollback và theo dõi 30–60 phút sau release.

## 7. Rollback

- Frontend/Worker: rollback deployment Cloudflare trước đó.
- Database: ưu tiên migration sửa tiếp; restore chỉ khi sự cố dữ liệu nghiêm trọng và có phê duyệt.
- Tắt tính năng rủi ro bằng feature flag/config; không xóa dữ liệu để “rollback nhanh”.
