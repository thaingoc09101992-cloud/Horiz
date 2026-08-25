# ADR-20260824 — Nền tảng frontend monorepo

## Trạng thái

Đã chấp nhận ngày 24/08/2026.

## Bối cảnh

Workspace HORIZ ban đầu chỉ có tài liệu và tài sản nguồn. Phase 1 cần tạo nền React có thể mở rộng thêm storefront, admin và Cloudflare Worker mà không đưa toàn bộ ứng dụng vào một package khó tách trách nhiệm.

## Quyết định

- Dùng npm workspaces với frontend tại `apps/storefront`.
- React 19, TypeScript strict, Vite 8 và React Router ở Declarative Mode.
- Tailwind CSS 4 được tích hợp bằng Vite plugin; design token và component styles hiện đặt trong CSS nền dùng chung.
- Admin routes được lazy-load để không đưa dashboard vào luồng storefront ban đầu.
- Supabase client chỉ được tạo khi có URL và publishable key; secret key không thuộc frontend.
- Cloudflare Pages build từ root bằng `npm run build`, output tại `apps/storefront/dist`.

## Phương án đã cân nhắc

- Một package Vite ở repository root: đơn giản hơn ban đầu nhưng khó thêm Worker/packages dùng chung.
- Turborepo: tốt cho monorepo lớn nhưng chưa cần ở quy mô Phase 1.
- React Router Framework Mode: nhiều tính năng hơn nhưng làm thay đổi quyền kiểm soát bundling/hosting đã chọn.

## Hệ quả

- Có thêm cấu trúc workspace nhưng chưa cần công cụ orchestration riêng.
- Storefront và admin dùng chung Auth/Theme/design system, admin vẫn được tách bundle.
- Khi thêm Worker, tạo `workers/api`; không đưa server secret vào `apps/storefront`.
- CSS nền cần được tách dần theo feature khi catalogue/admin module tăng kích thước.

## Migration và rollback

Không có dữ liệu cũ cần migrate. Rollback bằng cách loại bỏ workspace mới; tài sản nguồn và tài liệu hiện hữu không bị di chuyển hay ghi đè.
