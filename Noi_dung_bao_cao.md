# Nội dung báo cáo

> Dự án: **HORIZ Commerce** — storefront thương mại điện tử
> Repository: `Horiz/` · Nhánh chính: `main` · Ngày lập báo cáo: 06/09/2026

---

## 1. Mô tả dự án

| Hạng mục | Nội dung |
|---|---|
| **Lĩnh vực** | Thương mại điện tử (e-commerce) — bán lẻ **giày và thời trang** |
| **Thương hiệu** | **HORIZ** — slogan "Cùng bạn đi đến chân trời", phong cách *natural editorial minimalism* (tối giản, ấm, giàu hình ảnh) |
| **Thị trường** | Việt Nam · ngôn ngữ mặc định tiếng Việt · tiền tệ VND |
| **Nguồn tham chiếu** | Allbirds — chỉ học kiến trúc thông tin và hành trình mua hàng (UX pattern), **không** sao chép logo, nội dung, mã nguồn hay nhận diện |
| **Logo** | `HORIZ-logo.png`, `HORIZ-logo` (bản wordmark ở `apps/storefront/public/horiz-wordmark.png`); font logo tham chiếu *Perpetua Titling MT*, chỉ dùng dạng ảnh đã raster/outline. Component hiển thị: `src/components/brand/Wordmark.tsx` |
| **Bảng màu thương hiệu** | Nền `#f7f5ef`, brand xanh rêu `#234b3b`, accent cam đất `#c96f45` (xem `documents/DESIGN_SYSTEM.md`) |
| **Catalogue hiện có** | 291 sản phẩm (`catalogue.generated.json`) — Nữ 123, Nam 102, Unisex 65, Trẻ em 1; sinh từ manifest ảnh nguồn trong `Source/` |

### Kiến trúc & công nghệ

| Lớp | Công nghệ |
|---|---|
| **Frontend** | React 19 + TypeScript (strict) + Vite 8, React Router 8 (Declarative Mode), Tailwind CSS 4 (Vite plugin) |
| **Cấu trúc** | Monorepo npm workspaces — ứng dụng chính tại `apps/storefront` |
| **Backend** | Supabase — Postgres + Data API + RLS, Auth, Storage, Edge Function `admin-tools` |
| **Hosting** | Cloudflare Workers Builds; build từ gốc repo bằng `npm run build`, output `apps/storefront/dist` |
| **Thanh toán** | MVP dùng **COD** (thanh toán khi nhận hàng); trang xác nhận tạo mã QR đơn hàng bằng `qrcode.react` |
| **Thư viện chính** | `@supabase/supabase-js`, `lucide-react` (icon), `qrcode.react`, `read-excel-file` (import Excel ở admin), `@fontsource/*` (self-host font) |
| **Kiểm thử** | Vitest + Testing Library (unit cho pricing/cart/auth/shipping, test component admin/checkout); pgTAP cho RLS trong `supabase/tests/` |

---

## 2. Các trang trong dự án

Định tuyến khai báo tại `apps/storefront/src/app/App.tsx`.

### 2.1. Nhóm storefront (dùng chung `StorefrontLayout` — header + footer)

| Đường dẫn | Trang | Mô tả |
|---|---|---|
| `/` | **Trang Chủ** (`HomePage.tsx`) | Hero slideshow 4 banner (hiệu ứng parallax), khối "Sản phẩm mới", tile bộ sưu tập (Nam/Nữ/Unisex), carousel, brand story/manifesto, đăng ký bản tin |
| `/men`, `/women`, `/unisex`, `/toddler` | **Danh mục theo đối tượng** (`CataloguePage.tsx`) | Lưới sản phẩm, lọc theo category, sắp xếp theo giá / nổi bật |
| `/collections/:collection` | **Bộ sưu tập** (`CataloguePage.tsx`) | Ví dụ `/collections/new`, `/collections/best-sellers`, `/collections/shoes` |
| `/products/:productId` | **Chi tiết sản phẩm** (`ProductDetailPage.tsx`) | Gallery ảnh, chọn size/biến thể, số lượng, giá, tồn kho realtime từ Supabase, bảng size, thêm giỏ, thêm wishlist, sản phẩm liên quan |
| `/search` | **Tìm kiếm** (`SearchPage.tsx`) | Ô tìm kiếm + bộ lọc đối tượng / category / size / màu / sắp xếp, "load more", đồng bộ trạng thái qua query string |
| `/cart` | **Giỏ hàng** (`CartPage.tsx`) | Danh sách sản phẩm, tăng/giảm số lượng (chặn vượt tồn), xóa, tóm tắt đơn, ngưỡng miễn phí vận chuyển |
| `/checkout` | **Thanh toán** (`CheckoutPage.tsx`) | Form địa chỉ nhận hàng, tính phí vận chuyển (`lib/shipping.ts`), đặt hàng COD qua Supabase, màn xác nhận kèm mã QR đơn |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | **Xác thực** (`routes/auth/*`) | Đăng nhập, tự đăng ký thành viên, quên mật khẩu, đặt lại mật khẩu |
| `/about`, `/materials`, `/help`, `/returns`, `/privacy`, `/terms` | **Trang nội dung tĩnh** (`StaticContentPage.tsx`) | Về Chúng Tôi, Chất liệu, Trợ giúp/Liên hệ, Đổi trả, Quyền riêng tư, Điều khoản |

### 2.2. Nhóm tài khoản (yêu cầu đăng nhập — `AccountGuard`)

| Đường dẫn | Trang | Mô tả |
|---|---|---|
| `/account` | **Tổng quan tài khoản** (`account/AccountPage.tsx`) | Hồ sơ (họ tên, số điện thoại) |
| `/account/orders` | **Đơn hàng của tôi** | Lịch sử đơn, trạng thái, tổng tiền |
| `/account/addresses` | **Sổ địa chỉ** | Danh sách địa chỉ giao hàng |
| `/account/wishlist` | **Yêu thích** | Sản phẩm đã lưu |

### 2.3. Nhóm quản trị (yêu cầu quyền admin — `AdminGuard`, bundle tách riêng, lazy-load)

| Đường dẫn | Trang | Mô tả |
|---|---|---|
| `/admin` → `/admin/dashboard` | **Dashboard bán hàng & tồn kho** (`admin/AdminDashboardPage.tsx`) | KPI doanh thu / số đơn / giá trị đơn TB, biểu đồ tròn trạng thái đơn, KPI sức khỏe tồn kho, danh sách cảnh báo cần xử lý |
| `/admin/products` | **Sản phẩm** | CRUD sản phẩm, đổi trạng thái draft/published/archived, import Excel |
| `/admin/inventory` | **Tồn kho** | Cập nhật tồn thực tế theo SKU, cảnh báo sắp hết / hết hàng, import Excel |
| `/admin/pricing` | **Giá bán** | Chỉnh giá bán / giá so sánh theo biến thể, import Excel |
| `/admin/discounts` | **Chiết khấu** | Tạo / đổi trạng thái chương trình khuyến mãi |
| `/admin/orders` | **Đơn hàng** | Xem đơn, mở chi tiết sản phẩm trong đơn, đánh dấu "đã mở", cập nhật tiến trình xử lý |
| `/admin/members` | **Thành viên** | Tạo tài khoản, phân quyền (customer/staff/admin), khóa/mở khóa — qua Edge Function `admin-tools` |
| `/admin/content` | **Nội dung** | Quản lý khối nội dung CMS và trạng thái hiển thị |
| `/admin/audit-logs` | **Nhật ký hoạt động** | Tra cứu lịch sử thao tác hệ thống (chỉ đọc) |
| `*` | **404** (`NotFoundPage.tsx`) | Trang không tồn tại |

Tính năng chung trong bảng dữ liệu admin (`AdminPlaceholderPage.tsx`): ô tìm kiếm, sắp xếp theo cột, tải lại, modal tạo/sửa, import Excel với kiểm tra header và tải file mẫu.

---

## 3. Các chức năng đã thực hiện trong dự án

### Khách hàng / mua sắm
- Header responsive: mega menu (desktop), drawer menu (mobile), overlay tìm kiếm, menu tài khoản, badge số lượng giỏ hàng, đóng menu khi click ra ngoài.
- Trang chủ hero slideshow tự chuyển 4 banner, hiệu ứng parallax ảnh và chữ khi cuộn (`features/motion/useMotion.ts`).
- Danh sách sản phẩm: lọc theo danh mục, sắp xếp theo giá tăng/giảm hoặc "nổi bật".
- Trang tìm kiếm: tìm theo từ khóa (chuẩn hóa tiếng Việt), lọc đa tiêu chí, "xem thêm", chia sẻ kết quả qua URL.
- Chi tiết sản phẩm: gallery nhiều ảnh, chọn size, chỉ cho chọn biến thể còn hàng, số lượng không vượt tồn khả dụng, bảng hướng dẫn size, gợi ý sản phẩm liên quan.
- Tồn kho hiển thị theo thời gian thực từ Supabase (`inventory_items`), có xử lý khi chưa cấu hình Supabase.
- Giỏ hàng lưu ở `localStorage` (`horiz-cart-v1`), bền vững qua reload; cộng dồn cùng SKU, chặn vượt tồn.
- Checkout: nhập địa chỉ, tính phí vận chuyển, đặt hàng COD; **server (Supabase) tính lại giá + tồn** trước khi tạo đơn; màn xác nhận sinh mã QR đơn hàng.
- Đăng ký nhận bản tin (ghi vào `newsletter_subscribers`, xử lý trùng email).
- **Footer** (`StorefrontLayout.tsx`): đăng ký bản tin, nhóm liên kết **Về HORIZ** và **Chăm sóc khách hàng**, **bản đồ Google Maps + địa chỉ cửa hàng**, dòng bản quyền (chi tiết thay đổi trong conversation này — xem mục 5).

### Thành viên & xác thực
- Tự đăng ký bằng email/mật khẩu qua Supabase Auth (`signUp`), tài khoản mới luôn nhận vai trò `customer`.
- Đăng nhập (`signInWithPassword`), đăng xuất.
- Quên mật khẩu (`resetPasswordForEmail`) → email đặt lại → trang `reset-password` (`updateUser`).
- Thông báo lỗi xác thực chuẩn hóa, không lộ tài khoản tồn tại hay không (`routes/auth/authMessages.ts`, có unit test).
- `AuthProvider` cấp phiên và vai trò đã xác minh; `AccountGuard` / `AdminGuard` bảo vệ route.
- Trang tài khoản: xem/sửa hồ sơ, danh sách địa chỉ, lịch sử đơn, wishlist.

### Quản trị
- Link "Administrator" chỉ hiện khi phiên đăng nhập có vai trò `admin`; mọi route `/admin/*` và API kiểm tra quyền độc lập (ẩn link không phải cơ chế bảo mật).
- Dashboard: KPI doanh thu / đơn đã thanh toán / giá trị đơn trung bình, biểu đồ tròn trạng thái đơn (SVG tự vẽ), KPI tồn kho (giá trị tồn, hết hàng, sắp hết, đang reserve), danh sách cảnh báo có liên kết hành động.
- Module dữ liệu (Sản phẩm / Tồn kho / Giá / Chiết khấu / Đơn hàng / Thành viên / Nội dung / Nhật ký): bảng có tìm kiếm + sắp xếp theo cột, modal tạo/sửa, xóa (giới hạn theo loại).
- Import Excel cho Sản phẩm / Tồn kho / Giá: kiểm tra header bắt buộc, tải file mẫu `.xlsx`, gọi Edge Function `admin-tools`.
- Quản lý thành viên (tạo, phân quyền, khóa) chạy qua Edge Function đặc quyền, có ghi `audit_logs`.
- Đơn hàng: mở chi tiết dòng hàng, tự đóng dấu `opened_at` + chuyển sang "Đang xử lý" khi admin mở đơn mới lần đầu.

### Nền tảng / phi chức năng
- Chế độ shape theme (bo góc / vuông) lưu `localStorage`, áp dụng sớm trong `index.html`.
- SEO: meta description, Open Graph / Twitter card, `robots.txt`, `sitemap.xml` sinh tự động (`scripts/build-sitemap.mjs`) từ danh sách route + 291 sản phẩm.
- Bảo mật header qua Cloudflare `_headers` (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy); cache bất biến cho `/assets/*`.
- `ErrorBoundary`, `PageLoader` (Suspense fallback), `Portal` cho modal, skip-link "Bỏ qua đến nội dung chính".
- Supabase client chỉ khởi tạo khi có `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`; thiếu biến thì UI chạy chế độ "chưa kết nối", không giả lập quyền admin.
- Script phụ trợ: `build-catalogue.mjs` (sinh catalogue + copy ảnh từ `Source/`), `build-supabase-catalogue-seed.mjs` (sinh migration seed), `build-sitemap.mjs`.
- CSDL Supabase: 12 migration, ~34 bảng (catalogue, biến thể, tồn kho, giỏ, đơn, thanh toán, khuyến mãi, nội dung, audit…), RLS + grants least-privilege, checkout COD dạng idempotent, pgTAP test RLS.
- `Chay_Web_HORIZ.bat`: script tiện ích chạy web trên máy Windows.

---

## 4. Danh sách file `.md` và chức năng

### 4.1. Ở gốc repo

| File | Chức năng |
|---|---|
| `README.md` | Giới thiệu ngắn dự án, stack, lệnh chạy dev, điều khoản bản quyền & giấy phép |
| `Noi_dung_bao_cao.md` | **File báo cáo này** |

### 4.2. Thư mục `documents/` (bộ tài liệu bàn giao chung cho người & AI)

| File | Chức năng |
|---|---|
| `documents/README.md` | Mục lục bộ tài liệu, thứ tự đọc (16 tài liệu), phạm vi MVP, các quy tắc quan trọng |
| **`PRD.md`** | **Product Requirements Document** — mục tiêu sản phẩm, phân loại người dùng, **sitemap MVP**, yêu cầu chức năng phân mức P0/P1/P2, user story + acceptance criteria (chọn biến thể, thêm giỏ, đặt hàng, đăng ký, truy cập admin, dashboard), yêu cầu phi chức năng, phần ngoài phạm vi |
| `PROJECT_CONTEXT.md` | Bối cảnh & tầm nhìn dự án, hiện trạng workspace, thống kê tài sản ảnh/catalogue, giả định làm việc, quyết định còn mở, tiêu chí thành công (LCP/CLS/INP, WCAG 2.2 AA) |
| `REFERENCE_ANALYSIS.md` | Phân tích website tham chiếu Allbirds: cấu trúc điều hướng, nhịp nội dung trang chủ, pattern PLP/PDP/cart — để học UX, không sao chép |
| `BUSINESS_RULES.md` | Quy tắc nghiệp vụ: định nghĩa product/variant, quy tắc slug, điều kiện công khai sản phẩm, lưu tiền bằng `bigint` VND, công thức tồn kho `available = on_hand − reserved`, reserve khi checkout |
| `UI_GUIDELINE.md` | Nguyên tắc UI/UX, bảng layout responsive (breakpoint 320 / 640 / 1024 / 1440), đặc tả header, PLP, PDP, cart, form; yêu cầu accessibility |
| **`DESIGN_SYSTEM.md`** | **Hệ thiết kế** ("natural editorial minimalism") — design token CSS (màu, radius, shadow) cho chế độ sáng/tối, quy ước typography, nguyên tắc component. *(Dự án không có file tên `DESIGN.md`; tài liệu này giữ vai trò đó.)* |
| `DATABASE_SCHEMA.md` | Thiết kế CSDL Supabase: nguyên tắc (UUID, `timestamptz`, tiền `bigint`, RLS), mô tả ~34 bảng theo nhóm (identity, catalogue, inventory, cart, order, payment, promotion, content, audit) |
| `IMAGE_ASSETS.md` | Nguồn ảnh và quy trình nhập catalogue: vị trí manifest, các vấn đề dữ liệu cần xử lý, rủi ro bản quyền, quy ước đặt tên/kích thước ảnh |
| `ADMIN_REQUIREMENTS.md` | Đặc tả trang quản trị: mục tiêu back office, mô hình truy cập & phân quyền, danh sách permission, yêu cầu từng module quản trị |
| `DASHBOARD_KPI_SPEC.md` | Đặc tả dashboard bán hàng & tồn kho: câu hỏi vận hành cần trả lời, bộ lọc thời gian, định nghĩa từng KPI, biểu đồ, quy tắc so sánh kỳ trước & drill-down |
| `FONT_GUIDE.md` | Hướng dẫn font: vấn đề bản quyền *Perpetua Titling MT*, quyết định dùng logo dạng ảnh outline, font web đề xuất (Cormorant Garamond, Be Vietnam Pro) và cách self-host |
| `ARCHITECTURE.md` | Kiến trúc kỹ thuật: sơ đồ tầng (Cloudflare + Supabase), phân chia trách nhiệm client/Worker/Postgres, cấu trúc repo, luồng dữ liệu catalogue/checkout/auth, state & caching, security baseline, observability |
| `DEPLOYMENT.md` | Quy trình GitHub & triển khai Cloudflare: bảng môi trường (local/preview/production), workflow feature branch → PR → checks → preview → merge, quy tắc migration forward-only, cấu hình Cloudflare Workers Builds |
| `TASKS.md` | Kế hoạch triển khai theo phase (Phase 0 quyết định & dữ liệu, Phase 1 nền tảng, …) với checkbox tiến độ |
| `AGENTS.md` | Quy ước làm việc cho AI/cộng tác viên: thứ tự tài liệu bắt buộc đọc, nguyên tắc thực thi (không mở rộng phạm vi, không sao chép Allbirds, không lộ secret, không tin dữ liệu client) |
| `CODEX_MASTER_PROMPT.md` | "Master prompt" đầy đủ để giao cho Codex/Claude Code dựng lại toàn bộ website: mục tiêu, thành phần hệ thống, ràng buộc, tiêu chí hoàn thành |
| `documents/decisions/ADR-20260824-frontend-monorepo-foundation.md` | Architecture Decision Record: chốt nền tảng frontend monorepo (npm workspaces, React 19 + TS strict + Vite 8, Tailwind 4, admin lazy-load), phương án đã cân nhắc, hệ quả, migration/rollback |

---

## 5. Thứ tự các prompt trong conversation và kết quả

> Chủ đề conversation: **nhúng và bố cục bản đồ Google Maps vào footer**. Footer nằm trong `apps/storefront/src/components/layout/StorefrontLayout.tsx` (layout dùng chung nên bản đồ hiển thị ở chân mọi trang, gồm cả trang chủ). CSS ở `apps/storefront/src/styles/global.css`.

### Prompt 1 — Nhúng bản đồ vào footer trang chủ

**Yêu cầu:** người dùng cung cấp đoạn `<iframe>` Google Maps và đề nghị nhúng bản đồ vào footer trang chủ, địa chỉ HORIZ: *227 Nguyễn Văn Cừ, Phường Chợ Quán, HCM*.

**Kết quả:**
- Thêm `<section className="footer-map">` trong `StorefrontLayout.tsx` (ngay trên dòng `.footer-legal`): tiêu đề "Ghé thăm HORIZ" + địa chỉ + `<iframe>` bản đồ. Chuyển thuộc tính HTML sang JSX (`allowfullscreen` → `allowFullScreen`, `referrerpolicy` → `referrerPolicy`), thêm `title` cho iframe.
- Thêm CSS `.footer-map*` trong `global.css`: lưới 2 cột khớp `.footer-main`, iframe cao 300px, bo góc, phủ filter grayscale/invert cho hợp tông nền đen; responsive: gộp 1 cột ở ≤1100px, giảm chiều cao ở ≤760px.
- Chạy dev server (localhost:5173) kiểm tra: `.footer-map` render đúng ở cả desktop và mobile, src và địa chỉ chính xác.

### Prompt 2 — Bố cục lại footer cho gọn, chỉnh tỷ lệ bản đồ

**Yêu cầu:** kèm ảnh chụp — footer nhìn lộn xộn/rối mắt, bản đồ nằm quá sâu do khoảng trống lớn; cho phép cân chỉnh lại kích thước bản đồ.

**Kết quả:**
- **Tái cấu trúc `.footer-main` thành lưới 3 cột** cùng một hàng, canh trên (`align-items: start`): **Bản tin** · **Liên kết** (2 cụm) · **Địa chỉ + Bản đồ** → xóa hàng riêng nằm sâu, hết khoảng trống thừa.
- Đổi `.footer-map` → `.footer-contact`; bản đồ dùng `aspect-ratio: 16/10` + `max-width: 440px` (tự co giãn, không méo), thêm viền mờ; bổ sung link **"Xem chỉ đường"** mở Google Maps ở tab mới.
- Cập nhật breakpoint: ≤1100px → bản tin trải ngang trên cùng, hàng dưới Liên kết | Địa chỉ+Bản đồ; ≤760px → xếp dọc 1 cột.
- Kiểm tra DOM ở 3 khổ màn hình: 3 cột canh thẳng hàng (cùng `top`), **không tràn ngang**; kích thước bản đồ ~419×262px (desktop), ~342×214px (mobile). Ảnh chụp mobile xác nhận footer gọn.

### Prompt 3 — Địa chỉ không được xuống dòng

**Yêu cầu:** kèm ảnh — địa chỉ đang bị tách 2 dòng ("227 Nguyễn Văn Cừ," / "Phường Chợ Quán, TP. Hồ Chí Minh"); yêu cầu không xuống dòng như trong ảnh.

**Kết quả:**
- Xóa thẻ `<br />` trong phần tử `<address>` tại `StorefrontLayout.tsx` — địa chỉ thành một chuỗi liền: `227 Nguyễn Văn Cừ, Phường Chợ Quán, TP. Hồ Chí Minh`, chỉ tự wrap khi cột quá hẹp.
- Kiểm tra: thẻ `<br />` đã được gỡ; trên desktop địa chỉ hiển thị trọn một dòng.

### Prompt 4 — Lập báo cáo

**Yêu cầu:** thực hiện các mục trong ảnh (mô tả dự án, các trang, các chức năng, danh sách file `.md`, thứ tự prompt & kết quả) dựa trên dự án này và xuất ra file Markdown, tiêu đề **"Nội dung báo cáo"**.

**Kết quả:** tạo file `Noi_dung_bao_cao.md` ở gốc repo với đầy đủ 5 mục theo yêu cầu (chính là tài liệu này).

### Prompt 5 — Bỏ nhóm "Mua sắm" và bố cục lại footer

**Yêu cầu:** kèm ảnh — bỏ nhóm liên kết **"Mua sắm"** (Nam / Nữ / Sản phẩm mới) trong footer và bố cục lại các mục; cập nhật lại `Noi_dung_bao_cao.md` nếu có phát sinh.

**Kết quả:**
- Xóa `<div>` nhóm "Mua sắm" trong `.footer-links` (`StorefrontLayout.tsx`). `.footer-links` còn 2 nhóm: **Về HORIZ** và **Chăm sóc khách hàng**.
- `.footer-links` đổi từ lưới 2 cột sang **xếp dọc một cột** (`flex-direction: column`), 2 nhóm nằm chồng gọn trong cột giữa; bỏ quy tắc `.footer-links` 2 cột ở breakpoint ≤760px.
- `.footer-main` giữ **3 cột** nhưng cân lại tỷ lệ `1.5fr / 1fr / 1.5fr` (Bản tin · Liên kết · Địa chỉ + Bản đồ).
- Kiểm tra DOM: desktop 3 cột `444 / 296 / 444px` canh thẳng hàng, nhóm còn lại đúng là "Về HORIZ" + "Chăm sóc khách hàng", **không tràn ngang**; mobile xếp 1 cột, ảnh chụp xác nhận thứ tự footer: wordmark → bản tin → Về HORIZ → Chăm sóc khách hàng → địa chỉ + bản đồ → dòng bản quyền.
- Cập nhật tài liệu này (mục 2 & 3 bỏ nhắc nhóm "Mua sắm"; thêm Prompt 5).

### Prompt 6 — Đổi chủ đề / slogan trang web (prompt hiện tại)

**Yêu cầu:** đổi chủ đề trang web từ **"HORIZ — Chuyển động tự nhiên"** thành **"HORIZ — Cùng bạn đi đến chân trời"** cho các nội dung liên quan. Sau đó người dùng chốt phạm vi: chỉ đổi phần tiêu đề trang, **giữ nguyên** 4 chỗ mô tả vì chúng gắn với ý "chuyển động tự nhiên".

**Kết quả — đã đổi:**
- `apps/storefront/index.html`: `<title>`, `og:title`, `twitter:title` → "HORIZ — Cùng bạn đi đến chân trời".
- `StorefrontLayout.tsx` — dòng bản quyền footer: "© 2026 HORIZ. Thiết kế cho chuyển động tự nhiên." → "© 2026 HORIZ. Cùng bạn đi đến chân trời."
- Cập nhật mục 1 tài liệu này (slogan thương hiệu) và thêm Prompt 6.

**Giữ nguyên theo yêu cầu (không đổi):**
- `index.html` — `description`: "HORIZ — thiết kế chuyển động tự nhiên cho nhịp sống mỗi ngày."
- `index.html` — `og:description` & `twitter:description`: "Thiết kế linh hoạt, thoáng nhẹ cho mọi chuyển động thường ngày."
- `routes/ProductDetailPage.tsx` — meta description động: "{tên SP} — thiết kế HORIZ cho chuyển động tự nhiên."
- `routes/StaticContentPage.tsx` — tiêu đề trang **/about**: "Chuyển động tự nhiên, thiết kế có chủ đích."

Kiểm tra dev server: tiêu đề tab và dòng footer hiển thị slogan mới; 4 mô tả trên giữ nguyên.
