# Kế hoạch triển khai

## Phase 0 — quyết định và dữ liệu

- [ ] Chốt quyền sử dụng ảnh, chính sách bán hàng, payment và shipping.
- [ ] Review 291 thư mục; lập mapping model–color–size.
- [ ] Chốt brand copy, font license, palette và logo chính thức.
- [ ] Chọn display webfont: mặc định Cormorant SC; xác minh quyền nếu muốn nhúng Perpetua Titling MT.
- [ ] Tạo GitHub repository, branch protection, staging/prod projects.

## Phase 1 — nền tảng

- [x] Scaffold React + TypeScript + Vite và npm workspace.
- [x] Thiết lập Tailwind, token sáng/tối, self-hosted font và full screen utility.
- [ ] Supabase local, migrations, seed, generated DB types. Cấu hình/migration/seed/pgTAP đã tạo; còn chạy local stack và sinh types khi có Docker hoặc project đích.
- [ ] Auth đăng ký/xác minh email/đăng nhập/reset password; role customer mặc định và RBAC admin. Đã có đăng ký/đăng nhập, auth guard và customer trigger; còn reset password, admin provisioning và kiểm thử DB thực.
- [x] Layout, routing, header, footer, storefront/admin shell và error boundary. Mega menu chi tiết chuyển sang Phase 2 cùng catalogue.
- [ ] CI lint/typecheck/unit/build và Cloudflare preview. Workflow đã tạo và local checks xanh; còn khởi tạo GitHub repository và kết nối Cloudflare preview.

## Phase 2 — catalogue

- [ ] Viết importer CSV có validate + dry-run + report.
- [ ] Xử lý ảnh responsive và upload asset approved.
- [ ] Homepage, PLP, filter/sort/search, PDP/variant selector. Homepage, PLP Men/Women/Unisex/Toddler và PDP prototype đã có; catalogue lấy tối đa 12 sản phẩm mỗi nhóm, có filter/sort, gallery và chọn size. Còn search, variant/tồn kho thật, nối Supabase và thay asset đã cấp phép.
- [ ] Admin shell đồng bộ storefront: responsive, dark/light, full screen, sidebar/drawer.
- [ ] Dashboard sales: KPI cards, revenue/orders trend, status breakdown, top products và period comparison.
- [ ] Dashboard inventory: stock value, out/low/slow stock, reserved stock, category breakdown và action alerts.
- [ ] Định nghĩa metric, timezone, refund/cancel/test-order rules; đối soát KPI với drill-down.
- [ ] Tạo index/view/snapshot cần thiết; đo thời gian tải và chỉ thêm aggregate table khi dữ liệu thực tế yêu cầu.
- [ ] Admin CRUD catalogue/media, giá bán và price history.
- [ ] Admin tồn kho, stock adjustment, movement history và cảnh báo sắp hết.
- [ ] Admin chiết khấu: lịch áp dụng, target, priority, stacking, coupon và preview.
- [ ] SEO metadata, sitemap và Product structured data.

## Phase 3 — commerce

- [ ] Guest/account cart và merge cart. Guest cart frontend đã có localStorage, thêm/xóa/đổi số lượng/tính tạm tính; còn cart server-side, tồn kho, đăng nhập merge và checkout validation.
- [ ] Auth, profile, address, account orders.
- [ ] Checkout server-side, inventory reservation, payment integration.
- [ ] Webhook signature + idempotency; order email.
- [ ] Admin order lifecycle/refund có audit.
- [ ] Admin thành viên: tìm kiếm, xem hồ sơ/đơn, khóa/mở khóa, cấp role có kiểm soát.
- [ ] Link `Administrator` chỉ hiện với admin; test redirect 401 và forbidden 403.

## Phase 4 — hardening và launch

- [ ] RLS/grants test matrix; database advisors.
- [ ] Unit/integration/E2E, accessibility và cross-browser.
- [ ] Performance budget, image audit, cache/header audit.
- [ ] Privacy/terms/returns/contact content được duyệt.
- [ ] Backup/rollback drill, monitoring/alerts, production launch.

## Definition of Done

- Acceptance criteria đạt; test tương ứng tồn tại và chạy qua CI.
- Không có lỗi P0/P1, secret leak, RLS gap hoặc asset chưa rõ bản quyền.
- Dark/light, keyboard, mobile và full screen đã kiểm tra.
- Documentation/schema/types cập nhật cùng thay đổi.
- Nếu thay đổi database, business rule hoặc kiến trúc: migration/test/tài liệu liên quan và ADR khi cần đã nằm trong cùng PR/commit để Codex và Claude tiếp tục làm việc nhất quán.
