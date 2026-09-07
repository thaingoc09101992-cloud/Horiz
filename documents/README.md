# HORIZ Commerce — Bộ tài liệu dự án

> Phiên bản: 1.0 — cập nhật 24/08/2026

## Mục tiêu

Xây dựng website bán giày và thời trang HORIZ có trải nghiệm mua sắm, nhịp bố cục và mức hoàn thiện ngang các storefront thương mại điện tử hiện đại, sử dụng thương hiệu, nội dung, mã nguồn và hệ thiết kế riêng của HORIZ.

## Stack được chốt

- Frontend: React + TypeScript + Vite, responsive, hỗ trợ sáng/tối và nút toàn màn hình.
- UI: Tailwind CSS, component headless có khả năng truy cập tốt.
- Backend: Supabase Postgres, Auth, Storage, Edge Functions khi cần nghiệp vụ tin cậy.
- Hosting: Cloudflare Pages/Workers, triển khai tự động từ GitHub.
- Thanh toán: lớp tích hợp độc lập; nhà cung cấp cần chốt trước Sprint 3.

## Thứ tự đọc

1. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)
2. [REFERENCE_ANALYSIS.md](REFERENCE_ANALYSIS.md)
3. [PRD.md](PRD.md)
4. [BUSINESS_RULES.md](BUSINESS_RULES.md)
5. [UI_GUIDELINE.md](UI_GUIDELINE.md)
6. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
7. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
8. [IMAGE_ASSETS.md](IMAGE_ASSETS.md)
9. [ADMIN_REQUIREMENTS.md](ADMIN_REQUIREMENTS.md)
10. [DASHBOARD_KPI_SPEC.md](DASHBOARD_KPI_SPEC.md)
11. [FONT_GUIDE.md](FONT_GUIDE.md)
12. [ARCHITECTURE.md](ARCHITECTURE.md)
13. [DEPLOYMENT.md](DEPLOYMENT.md)
14. [TASKS.md](TASKS.md)
15. [AGENTS.md](AGENTS.md)
16. [CODEX_MASTER_PROMPT.md](CODEX_MASTER_PROMPT.md)

## Phạm vi MVP

Trang chủ, danh mục, tìm kiếm/lọc, chi tiết sản phẩm và biến thể, giỏ hàng, đăng ký/đăng nhập thành viên, địa chỉ, checkout, đơn hàng, tài khoản và trang quản trị đầy đủ cho sản phẩm, giá, tồn kho, chiết khấu, đơn hàng và thành viên.

## Quy tắc quan trọng

- Không sao chép logo, câu chữ, mã nguồn hoặc nhận diện độc quyền của bất kỳ thương hiệu nào khác.
- Ảnh nguồn bên thứ ba trong `Source` chỉ dùng cho nghiên cứu/prototype khi chưa chứng minh được quyền thương mại.
- Giá lưu bằng số nguyên VND; không lưu chuỗi đã định dạng.
- Mọi bảng thuộc schema được Data API công khai phải bật RLS và cấp quyền tối thiểu.
- Không đưa khóa Supabase secret/service role vào frontend hoặc GitHub.
- Codex và Claude phải dùng `documents` làm nguồn bàn giao chung; thay đổi lớn về database, business rule hoặc kiến trúc phải cập nhật code, test và tài liệu trong cùng thay đổi.
