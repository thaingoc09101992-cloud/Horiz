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

- Kết nối repository GitHub với Pages hoặc Workers Builds.
- Build từ repository root bằng `npm run build`; thư mục output Cloudflare Pages là `apps/storefront/dist`.
- SPA fallback được khai báo tại `apps/storefront/public/_redirects`; security/cache headers tại `apps/storefront/public/_headers`.
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
