# Nội dung báo cáo — Đồ án cuối khóa

**Tên dự án:** HORIZ Commerce — Website bán giày & thời trang
**Học viên:** Dương Thái Ngọc
**Repository:** https://github.com/thaingoc09101992-cloud/Horiz
**Website đã host:** https://horiz.thaingoc09101992.workers.dev/

---

## 1. Mô tả dự án

### 1.1. Lĩnh vực

Thương mại điện tử (e‑commerce) — cửa hàng trực tuyến bán **giày và thời trang**. Dự án xây dựng một storefront hoàn chỉnh cho khách mua hàng cùng một trang quản trị (back office) cho người bán, với luồng mua sắm đầy đủ từ duyệt danh mục đến đặt hàng và quản lý đơn.

### 1.2. Thương hiệu

**HORIZ** là **thương hiệu hư cấu** do học viên tự đặt ra cho đồ án. Toàn bộ tên thương hiệu, giọng nội dung (brand copy), hệ thiết kế và mã nguồn là của HORIZ. Định hướng thương hiệu: *"Natural editorial minimalism"* — tối giản, ấm, có chất liệu; sản phẩm là nhân vật chính, giao diện gọn và trung tính.

> **Lưu ý về hình ảnh sản phẩm:** ảnh sản phẩm trong catalogue là ảnh mẫu, chỉ dùng để dựng prototype minh họa cho đồ án học tập, không dùng cho mục đích thương mại (chi tiết nguồn ảnh và trạng thái quyền sử dụng được ghi trong `documents/IMAGE_ASSETS.md`).

### 1.3. Logo

Logo là **wordmark** chữ "HORÏZ" kiểu serif thanh lịch (nguồn: `elegant_horïz_serif_wordmark.png`, phục vụ web dưới tên an toàn `apps/storefront/public/horiz-wordmark.png`). Logo được render nhất quán qua component dùng chung `Wordmark.tsx`, xuất hiện ở **header** và **footer** trên mọi trang. Quy ước font/logo và vấn đề bản quyền webfont được ghi trong `documents/FONT_GUIDE.md`.

### 1.4. Công nghệ sử dụng

| Nhóm | Công nghệ |
|---|---|
| Frontend | React 19 + TypeScript (strict) + Vite 8 |
| Định tuyến | React Router 8 (Declarative Mode, `BrowserRouter`) |
| Giao diện | Tailwind CSS 4 + hệ design token trong `global.css`; phong cách editorial, responsive theo breakpoint, hỗ trợ `prefers-reduced-motion` |
| Backend / CSDL | **Supabase** — PostgreSQL + Auth + Storage + Row Level Security (RLS) + Edge Functions |
| Xử lý đặc quyền | Supabase Edge Function `admin-tools` (Deno) chạy bằng service role |
| Thư viện phụ | `lucide-react` (icon), `qrcode.react` (mã QR đơn hàng), `read-excel-file` (đọc Excel khi nhập liệu), `@fontsource` (self‑host font Be Vietnam Pro + Cormorant Garamond) |
| Kiểm thử | Vitest + Testing Library + jsdom (unit/component); pgTAP (test RLS trên CSDL) |
| CI/CD | GitHub Actions (`lint` + `typecheck` + `test` + `build`) |
| Hosting | **Cloudflare Workers** (static assets) qua `wrangler`; deploy tự động từ nhánh `main` trên GitHub. *Giảng viên đã đồng ý dùng Cloudflare thay cho GitHub Pages.* |

> **Về yêu cầu "database SQLite":** dự án dùng **Supabase (PostgreSQL)** thay cho SQLite — đã được giảng viên đồng ý. Đây vẫn là một CSDL quan hệ thật, có 13 file migration, schema đầy đủ (`products`, `product_variants`, `orders`, `order_items`, `inventory_items`, `profiles`, `addresses`, `user_roles`…), RLS và test.

---

## 2. Các trang trong dự án

### 2.1. Ba trang bắt buộc theo yêu cầu

| Yêu cầu | Đường dẫn | Mô tả |
|---|---|---|
| **Trang Chủ** (Home Page) | `/` | Trang chủ storefront: hero, sản phẩm mới, danh mục, bộ sưu tập, khối chất liệu/triết lý |
| **Về Chúng Tôi** (About Us) | `/about` | Câu chuyện HORIZ; footer của trang có **nhúng Google Maps** (bản đồ đường tới cửa hàng) + link chỉ đường |
| **Chi tiết sản phẩm** (Detail) | `/products/:productId` | Trang chi tiết một sản phẩm (PDP) |

### 2.2. Toàn bộ trang trong ứng dụng

| Đường dẫn | Trang | Chức năng chính |
|---|---|---|
| `/` | Trang chủ | Hero, carousel "Sản phẩm mới", khối danh mục Nam/Nữ/Unisex, khối bộ sưu tập, khối editorial chất liệu |
| `/men`, `/women`, `/unisex`, `/toddler` | Danh mục sản phẩm (PLP) | Lưới sản phẩm theo đối tượng, lọc theo danh mục con, sắp xếp theo giá/độ nổi bật |
| `/collections/:collection` | Bộ sưu tập | PLP cho một bộ sưu tập (ví dụ `/collections/new`) |
| `/products/:productId` | Chi tiết sản phẩm (PDP) | Gallery ảnh, chọn size theo biến thể thật + tồn kho, chọn số lượng, thêm vào giỏ, hướng dẫn chọn size, sản phẩm liên quan, JSON‑LD schema.org |
| `/search` | Tìm kiếm | Tìm theo từ khóa; lọc đối tượng / danh mục / size / màu; sắp xếp; bộ lọc lưu trên URL |
| `/cart` | Giỏ hàng | Xem/sửa số lượng/xóa dòng, tạm tính + phí vận chuyển, ngưỡng miễn phí ship |
| `/checkout` | Thanh toán | Đặt hàng COD cho khách vãng lai và thành viên; nhập thông tin nhận hàng; trang thành công có mã đơn + mã QR |
| `/login` | Đăng nhập | Đăng nhập bằng email + mật khẩu |
| `/register` | Đăng ký | Tạo tài khoản + xác minh email; mặc định nhận vai trò `customer` |
| `/forgot-password` | Quên mật khẩu | Gửi email đặt lại mật khẩu |
| `/reset-password` | Đặt lại mật khẩu | Nhập mật khẩu mới từ link trong email |
| `/about` | Về chúng tôi | Câu chuyện & triết lý thương hiệu |
| `/materials` | Chất liệu | Giới thiệu vật liệu (len Merino, sợi cây, vật liệu tái chế) |
| `/help` | Hỗ trợ / Liên hệ | Thông tin liên hệ, giờ làm việc, hướng dẫn chọn size |
| `/returns` | Đổi trả | Chính sách đổi trả 30 ngày |
| `/privacy` | Quyền riêng tư | Chính sách dữ liệu cá nhân |
| `/terms` | Điều khoản | Điều khoản sử dụng & bán hàng |
| `/account` | Tài khoản — Tổng quan | Cập nhật hồ sơ (họ tên, SĐT); thẻ tóm tắt số đơn/địa chỉ/yêu thích *(cần đăng nhập)* |
| `/account/orders` | Tài khoản — Đơn hàng | Danh sách đơn đã đặt bằng tài khoản |
| `/account/addresses` | Tài khoản — Địa chỉ | Thêm / xóa địa chỉ giao hàng, đặt mặc định |
| `/account/wishlist` | Tài khoản — Yêu thích | Danh sách sản phẩm đã lưu, xóa khỏi danh sách |
| `/admin` → `/admin/dashboard` | Quản trị — Dashboard | KPI doanh thu/đơn hàng, cảnh báo tồn kho, biểu đồ doanh thu theo ngày, trạng thái đơn *(chỉ vai trò `admin`)* |
| `/admin/:section` | Quản trị — các mục | Khung điều hướng cho orders / products / inventory / members / discounts; kèm công cụ nhập liệu Excel |
| `*` | 404 | Trang không tìm thấy |

**Điều hướng giữa các trang:** header có thanh menu (`NavLink`), mega‑menu và menu di động; footer có nhóm link "Về HORIZ" / "Chăm sóc khách hàng"; các trang liên kết chéo với nhau (trang chủ → danh mục → chi tiết → giỏ → thanh toán; footer → About/Chất liệu/Liên hệ…).

---

## 3. Các chức năng đã thực hiện

### 3.1. Mua sắm (storefront)

- **Danh mục & lọc/sắp xếp:** duyệt sản phẩm theo Nam/Nữ/Unisex/Trẻ em, lọc theo danh mục con, sắp xếp theo "Nổi bật / Giá tăng dần / Giá giảm dần".
- **Tìm kiếm:** ô tìm kiếm nhanh ở header (SearchOverlay) + trang tìm kiếm đầy đủ với bộ lọc đối tượng / danh mục / size / màu và sắp xếp theo giá/tên; trạng thái bộ lọc lưu trên URL để chia sẻ/reload.
- **Chi tiết sản phẩm:** gallery nhiều ảnh, chọn **size theo biến thể (variant) thật** — đọc `product_variants` + tồn kho `inventory_items` từ Supabase, hiển thị "còn N sản phẩm" hoặc "hết hàng", bắt buộc chọn size trước khi thêm giỏ, modal hướng dẫn chọn size, dữ liệu có cấu trúc JSON‑LD (`schema.org/Product`), gợi ý sản phẩm liên quan.
- **Giỏ hàng:** thêm / tăng giảm số lượng / xóa dòng; cùng sản phẩm khác size là hai dòng riêng; tính tạm tính + phí vận chuyển theo ngưỡng miễn phí ship; giỏ lưu ở `localStorage` (key `horiz-cart-v1`), giữ nguyên sau khi tải lại trang.
- **Bản đồ cửa hàng:** nhúng iframe Google Maps ở footer + link "Xem chỉ đường".
- **Đăng ký nhận bản tin:** form ở footer → ghi vào bảng `newsletter_subscribers`.

### 3.2. Đặt hàng (checkout)

- **Thanh toán COD** cho cả **khách vãng lai** và **thành viên**: nhập email nhận xác nhận, người nhận, số điện thoại, địa chỉ; chọn phương thức COD.
- Khi xác nhận, gọi hàm PostgreSQL `place_cod_order` (RPC) để **tạo đơn hàng trong một giao dịch**: ghi `orders` + `order_items` (kèm snapshot tên/SKU/giá), xử lý tồn kho, sinh mã đơn.
- **Trang đặt hàng thành công:** hiển thị mã đơn, **mã QR** (qrcode.react) và tổng tiền.

### 3.3. Tài khoản & xác thực

- **Đăng ký** (`auth.signUp`) + xác minh email; trigger CSDL `handle_new_user` tự gán vai trò `customer`.
- **Đăng nhập** (`signInWithPassword`), **Đăng xuất**.
- **Quên mật khẩu** (`resetPasswordForEmail`) → **Đặt lại mật khẩu** (`updateUser`).
- **AccountGuard:** chặn truy cập `/account/*` khi chưa đăng nhập.
- **Trang tài khoản:**
  - *Hồ sơ:* cập nhật họ tên + số điện thoại (ghi vào `profiles`).
  - *Đơn hàng:* xem danh sách đơn của chính mình (được RLS bảo vệ).
  - *Địa chỉ:* thêm mới, xóa, đặt địa chỉ mặc định (`addresses`).
  - *Yêu thích:* xem và xóa sản phẩm khỏi wishlist (`wishlists`).

### 3.4. Quản trị (admin back office)

- **Phân quyền:** dùng chung Supabase Auth với storefront. Chỉ user có vai trò `admin` mới thấy link "Administrator" và vào được `/admin`; chưa đăng nhập bị đưa về `/login?returnTo=/admin`; đăng nhập nhưng không đủ quyền nhận 403. Mọi thao tác ghi đều được kiểm tra ở **server + RLS**, không dựa vào việc ẩn link.
- **Dashboard bán hàng & tồn kho:** KPI doanh thu / số đơn đã thanh toán / giá trị đơn trung bình theo kỳ (hôm nay / 7 ngày / 30 ngày); cảnh báo "SKU hết hàng / sắp hết / đang giữ chỗ"; biểu đồ cột doanh thu theo ngày; biểu đồ tròn trạng thái đơn; danh sách "hành động cần xử lý"; giá trị tồn kho theo giá vốn.
- **Công cụ nhập liệu bằng Excel:** tải file mẫu `.xlsx`, upload file để **nhập Sản phẩm / Tồn kho / Giá bán**; dữ liệu được đọc ở trình duyệt (`read-excel-file`) rồi gửi tới Edge Function.
- **Edge Function `admin-tools`** (chạy bằng service role sau khi xác thực caller là admin đang active): `create_member`, `update_member` (khóa/mở khóa, đổi vai trò), `import_products`, `import_inventory`, `import_pricing`.

### 3.5. Các chức năng chỉnh sửa cơ sở dữ liệu (yêu cầu ≥ 2: insert / update / delete)

Dự án có **nhiều hơn 2** nhóm thao tác ghi CSDL thật:

| # | Thao tác | Bảng / hàm | Vị trí |
|---|---|---|---|
| 1 | **INSERT** | `orders` + `order_items` (qua RPC `place_cod_order`) | Trang thanh toán |
| 2 | **UPDATE** | tồn kho khi tạo đơn | RPC `place_cod_order` |
| 3 | **INSERT / DELETE** | `addresses` (thêm / xóa địa chỉ) | Tài khoản → Địa chỉ |
| 4 | **UPDATE** | `profiles` (cập nhật hồ sơ) | Tài khoản → Tổng quan |
| 5 | **DELETE** | `wishlists` (xóa sản phẩm yêu thích) | Tài khoản → Yêu thích |
| 6 | **INSERT** | `newsletter_subscribers` (đăng ký bản tin) | Footer |
| 7 | **INSERT / UPDATE** | tạo & sửa thành viên; nhập sản phẩm / tồn kho / giá bán | Admin (Edge Function `admin-tools`) |

---

## 4. Danh sách các file .md và chức năng

### 4.1. Trả lời trực tiếp câu hỏi trong đề: "File PRD.md, DESIGN.md có tác dụng gì?"

- **`PRD.md`** (Product Requirements Document — *Tài liệu yêu cầu sản phẩm*): trả lời câu hỏi **"làm cái gì"**. Ghi rõ mục tiêu sản phẩm, các nhóm người dùng (khách vãng lai, thành viên, nhân viên, admin), sitemap MVP và phạm vi tính năng. Đây là căn cứ để chốt phạm vi, tránh làm lan man ngoài yêu cầu.
- **`DESIGN.md`** — trong dự án này tương ứng file **`DESIGN_SYSTEM.md`**: trả lời câu hỏi **"trông như thế nào"**. Ghi các *design token* (bảng màu, bo góc, đổ bóng, khoảng cách), định hướng thị giác "natural editorial minimalism" và quy tắc để mọi trang đồng nhất về giao diện. Đi kèm là `UI_GUIDELINE.md` (layout responsive, đặc tả từng khối màn hình, accessibility) và `FONT_GUIDE.md` (typography, license font).

### 4.2. Toàn bộ file `.md` trong dự án

| File | Tác dụng |
|---|---|
| `README.md` (thư mục gốc) | Giới thiệu ngắn về dự án, hướng dẫn chạy dev, thông tin bản quyền & giấy phép |
| `documents/README.md` | Mục lục bộ tài liệu dự án + thứ tự đọc đề xuất + stack đã chốt |
| `documents/PROJECT_CONTEXT.md` | Bối cảnh & tầm nhìn dự án, hiện trạng workspace, thống kê tài sản ảnh nguồn |
| `documents/REFERENCE_ANALYSIS.md` | Phân tích tham khảo kiến trúc thông tin và hành trình mua hàng của các website thương mại điện tử để rút ra pattern UX chung cho HORIZ |
| `documents/PRD.md` | Tài liệu yêu cầu sản phẩm: mục tiêu, người dùng, sitemap MVP, phạm vi tính năng |
| `documents/BUSINESS_RULES.md` | Quy tắc nghiệp vụ: catalogue/biến thể, tiền tệ (lưu `bigint` VND), tồn kho (`available = on_hand − reserved`), giỏ hàng, checkout |
| `documents/UI_GUIDELINE.md` | Nguyên tắc UI/UX, layout responsive theo breakpoint, đặc tả header / trang chủ / PLP / PDP, yêu cầu accessibility |
| `documents/DESIGN_SYSTEM.md` | Hệ thiết kế: design token (màu, radius, shadow), định hướng thị giác, quy ước sáng/tối |
| `documents/DATABASE_SCHEMA.md` | Thiết kế CSDL Supabase: nguyên tắc, danh sách bảng (identity, catalogue, order, inventory…), RLS |
| `documents/IMAGE_ASSETS.md` | Nguồn ảnh, vấn đề bản quyền, mapping từ file CSV manifest sang bảng, pipeline nhập catalogue |
| `documents/ADMIN_REQUIREMENTS.md` | Đặc tả trang quản trị: mục tiêu, phân quyền staff/admin, sitemap khu vực admin |
| `documents/DASHBOARD_KPI_SPEC.md` | Đặc tả dashboard: công thức từng KPI, bộ lọc kỳ, quy tắc doanh thu / refund / timezone |
| `documents/FONT_GUIDE.md` | Hướng dẫn font: license (Perpetua Titling MT), cặp font web, cách xử lý wordmark |
| `documents/ARCHITECTURE.md` | Kiến trúc kỹ thuật: sơ đồ Browser / Cloudflare / Supabase, phân chia trách nhiệm client – Worker – CSDL |
| `documents/DEPLOYMENT.md` | Quy trình GitHub + triển khai Cloudflare Workers, biến môi trường, checklist phát hành, kế hoạch rollback |
| `documents/TASKS.md` | Kế hoạch triển khai theo Phase 0–3 và trạng thái từng hạng mục |
| `documents/AGENTS.md` | Quy ước làm việc cho AI / cộng tác viên: thứ tự đọc tài liệu, nguyên tắc thực thi, chuẩn code |
| `documents/CODEX_MASTER_PROMPT.md` | "Master prompt" tổng hợp yêu cầu để giao cho công cụ AI dựng dự án |
| `documents/decisions/ADR-20260824-frontend-monorepo-foundation.md` | ADR (Architecture Decision Record): quyết định nền tảng monorepo — npm workspaces, React 19, Vite 8, React Router Declarative Mode |

*(Các file `.md` được dùng thật trong dự án: `README.md` gốc hiển thị trên GitHub và liên kết sang thư mục `documents/`; toàn bộ tài liệu đặc tả nằm trong `documents/`.)*
