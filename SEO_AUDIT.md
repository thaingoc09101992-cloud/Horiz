# HORIZ — SEO Audit

Ngày audit: 2026-09-14
Phạm vi: `apps/storefront` (Vite + React 19 + react-router 8, client-side rendering, deploy tĩnh lên Cloudflare Workers assets — xem `apps/storefront/wrangler.jsonc`).

Kiến trúc ghi nhận trước khi audit:
- **Không có SSR/SSG.** Đây là SPA render hoàn toàn phía client. `index.html` chỉ chứa một `<div id="root">` rỗng; toàn bộ nội dung, kể cả `<title>`/`<meta>` động, được JavaScript chèn vào sau khi tải.
- Deploy là "pure static build" (comment trong `wrangler.jsonc`): không có Worker script chạy phía server, `not_found_handling: "single-page-application"` khiến **mọi URL không khớp asset đều trả về `index.html` với HTTP 200** (không có 404 thật).
- 291 sản phẩm, dữ liệu tĩnh tại `src/data/catalogue.generated.json`, sitemap sinh tự động qua `scripts/build-sitemap.mjs`.

Mức độ:
- 🔴 **CRITICAL** — chặn crawl/index hoặc gây duplicate content nghiêm trọng
- 🟠 **HIGH** — ảnh hưởng lớn đến ranking
- 🟡 **MEDIUM** — tối ưu thêm
- 🟢 **LOW** — cải tiến nhỏ
- ✅ **Đã sửa trong lần triển khai này** (xem [SEO_IMPLEMENTATION.md](SEO_IMPLEMENTATION.md) để biết chi tiết)
- ⏸️ **Chưa sửa — cần quyết định của bạn** (xem [SEO_RECOMMENDATIONS.md](SEO_RECOMMENDATIONS.md))

| Priority | Issue | Location | Impact | Recommended Fix | Status |
|---|---|---|---|---|---|
| 🔴 CRITICAL | Mọi trang dùng chung 1 `<title>`/`<meta description>` tĩnh từ `index.html` — không có metadata riêng theo route | Toàn bộ `src/routes/*` (trước khi sửa) | Google thấy title/description trùng lặp trên hàng trăm URL (home, 291 sản phẩm, danh mục, static pages đều là "HORIZ — Cùng bạn đi đến chân trời") | Xây hệ thống metadata tập trung, áp dụng theo route | ✅ Đã sửa — `src/lib/seo.ts` + áp dụng trên toàn bộ route |
| 🔴 CRITICAL | `/collections/:slug` không xác định (bất kỳ chuỗi nào không khớp `women/men/unisex/toddler/new/best-sellers`) trả về HTTP 200 với nội dung y hệt "tất cả sản phẩm" — không giới hạn số lượng URL | `CataloguePage.tsx` | Duplicate/thin content không giới hạn: Google có thể phát hiện vô số URL `/collections/xyz` giống hệt nhau qua liên kết nội bộ (mega menu trỏ tới `/collections/shoes`, `/collections/apparel`, `/collections/accessories` — các slug này **chưa có logic lọc riêng**, xem ghi chú business-logic bên dưới) | Đánh `noindex` cho mọi slug không nằm trong danh sách nội dung đã định nghĩa; loại khỏi sitemap | ✅ Đã sửa (kỹ thuật). ⏸️ Việc lọc thật theo `product.category` cho các slug này là thay đổi hành vi hiển thị sản phẩm — cần bạn quyết định, xem khuyến nghị |
| 🔴 CRITICAL | `/collections/new` và `/collections/best-sellers` hiện hiển thị **y hệt** toàn bộ 291 sản phẩm (không có field "mới"/"bán chạy" trong dữ liệu để lọc) → hai trang này trùng nội dung với nhau và với trang chủ | `CataloguePage.tsx` (`pageContent.new`, `pageContent['best-sellers']` không có `audience`) | Nội dung mỏng, trùng lặp giữa 2 URL được quảng bá chính (nav, hero "Xem tất cả") | Cần dữ liệu thật (cờ "mới", số liệu bán hàng) để lọc — đây là quyết định dữ liệu/sản phẩm | ⏸️ Chưa sửa — cần bạn quyết định (xem khuyến nghị) |
| 🔴 CRITICAL | SPA fallback trả **HTTP 200** cho mọi URL không tồn tại thay vì 404 thật | `wrangler.jsonc` (`not_found_handling: "single-page-application"`) | Google/công cụ audit có thể coi các URL rác là "soft 404"; lãng phí crawl budget | Thêm `noindex` trong `NotFoundPage` (đã làm) làm giảm nhẹ tác động; fix triệt để đòi hỏi đổi kiến trúc deploy (thêm Worker script để set status 404) | ✅ Giảm nhẹ (noindex). ⏸️ Fix triệt để cần đổi kiến trúc — cần bạn quyết định |
| 🟠 HIGH | Trang danh mục (`/women`, `/men`, `/unisex`, `/toddler`, `/collections/*`) không có `<h1>` nào trong DOM | `CataloguePage.tsx` | Thiếu tín hiệu chủ đề trang cho Google; cũng là lỗi accessibility (không có heading cấp trang cho screen reader) | Thêm `<h1>` — dùng class `sr-only` có sẵn để không đổi giao diện | ✅ Đã sửa |
| 🟠 HIGH | Product JSON-LD dùng `sku: product.id` (chuỗi slug nội bộ, vd. `men-shoes-mens-cruiser-natural-white`) thay vì SKU thật (`product.sku`, vd. `HRZ-MEN-241DC`) | `ProductDetailPage.tsx` (trước khi sửa) | Structured data sai lệch dữ liệu thực tế — vi phạm nguyên tắc Merchant/Rich Results của Google | Dùng đúng field `product.sku` | ✅ Đã sửa |
| 🟠 HIGH | Không có canonical tag trên bất kỳ trang nào ngoài Product | Toàn bộ route trừ `ProductDetailPage` (trước khi sửa) | Rủi ro duplicate nếu trang truy cập qua nhiều URL/param | Canonical tự sinh theo path cho mọi route | ✅ Đã sửa |
| 🟠 HIGH | Không có Organization / WebSite JSON-LD ở cấp site | `index.html` | Mất cơ hội Knowledge Panel, Sitelinks Search Box | Thêm JSON-LD tĩnh trong `index.html` (không phụ thuộc JS) | ✅ Đã sửa |
| 🟠 HIGH | Trang sản phẩm không có `BreadcrumbList` schema dù đã có breadcrumb UI thật (`pdp-breadcrumb`) | `ProductDetailPage.tsx` | Mất rich result breadcrumb trên SERP | Thêm `BreadcrumbList` JSON-LD khớp breadcrumb hiển thị | ✅ Đã sửa |
| 🟠 HIGH | `robots.txt` không tham chiếu `sitemap.xml` | `public/robots.txt` | Google/Bing phải tự dò sitemap thay vì được khai báo trực tiếp | Thêm dòng `Sitemap:` | ✅ Đã sửa |
| 🟠 HIGH | Trang tiện ích (giỏ hàng, checkout, tài khoản, đăng nhập/đăng ký, admin, 404, tìm kiếm nội bộ) không có chỉ định `noindex` — có thể bị Google index dù không có giá trị tìm kiếm | `CartPage`, `CheckoutPage`, `AccountPage`, `LoginPage`/`RegisterPage`/`ForgotPasswordPage`/`ResetPasswordPage` (qua `AuthCard`), `AdminLayout`, `SearchPage`, `NotFoundPage` | Lãng phí crawl budget, có thể index nội dung riêng tư/giao dịch | Thêm `<meta name="robots" content="noindex,follow">` | ✅ Đã sửa |
| 🟠 HIGH | Ảnh sản phẩm chính trên PDP (khả năng cao là phần tử LCP) không có `fetchPriority="high"` | `ProductDetailPage.tsx` | LCP chậm hơn cần thiết trên trang sản phẩm — trang có traffic/conversion cao nhất | Thêm `fetchPriority="high"` | ✅ Đã sửa |
| 🟡 MEDIUM | Cả 4 ảnh hero trên trang chủ tải cùng mức ưu tiên dù chỉ 1 ảnh hiển thị ban đầu | `HomePage.tsx` | Cạnh tranh băng thông với ảnh LCP thật (slide đầu) | Đặt `fetchPriority="low"` cho slide 2-4 (giữ eager để không giật khi crossfade) | ✅ Đã sửa |
| 🟡 MEDIUM | Ảnh sản phẩm mới/collection/editorial trên trang chủ (dưới fold) không có `loading="lazy"` | `HomePage.tsx` | Tải dư băng thông ban đầu, cạnh tranh với ảnh hero | Thêm `loading="lazy"` | ✅ Đã sửa |
| 🟡 MEDIUM | Không có `Cache-Control` cho ảnh tĩnh `/catalogue/*`, `/prototype/*` (chỉ `/assets/*` được cache dài hạn) | `public/_headers` | Ảnh sản phẩm phải tải lại mỗi lần ghé thăm, ảnh hưởng LCP ở lượt truy cập lặp lại | Thêm `Cache-Control` vừa phải (không dùng `immutable` vì file không có hash) | ✅ Đã sửa |
| 🟡 MEDIUM | Bundle JS chính (`index-*.js`) ~631 KB / 147 KB gzip — Vite cảnh báo vượt 500 KB | build output | Ảnh hưởng thời gian tương tác (INP), đặc biệt trên mobile/mạng chậm | Code-split thêm (tách vendor, import `lucide-react` theo icon thay vì để Vite gộp), cần rà soát kỹ hơn | ⏸️ Khuyến nghị — không tự động refactor vì rủi ro phá vỡ hành vi runtime |
| 🟡 MEDIUM | Danh mục sản phẩm không có breadcrumb hiển thị (chỉ Product page có) | `CataloguePage.tsx` | Thiếu UI điều hướng + không thể thêm `BreadcrumbList` schema trung thực nếu không có breadcrumb hiển thị tương ứng | Thêm breadcrumb UI — đây là thay đổi giao diện, cần bạn quyết định | ⏸️ Chưa sửa — cần bạn quyết định |
| 🟢 LOW | Font tự host (`@fontsource`) đã dùng `font-display: swap` và subset tiếng Việt sẵn — không có vấn đề FOIT/FOUT | `src/main.tsx` | Không có | Không cần sửa; có thể cân nhắc `<link rel="preload">` cho weight 400 nếu muốn tối ưu thêm (đòi hỏi biết tên file đã hash lúc build) | ⏸️ Khuyến nghị nhẹ |
| 🟢 LOW | CLS: hầu hết ảnh đã có `aspect-ratio` qua CSS (`.ab-product-card__image`, `.pdp-gallery__main`, v.v.) | `src/styles/global.css` | Rủi ro CLS đã được kiểm soát tốt | Không cần sửa | ✅ Đã kiểm tra, ổn |
| 🟢 LOW | `<html lang="vi">` đã đúng, không có mixed content (`http://`) trong source | `index.html` | Không có | Không cần sửa | ✅ Đã kiểm tra, ổn |
| 🟢 LOW | Không phát hiện Google Analytics / Search Console verification nào trong source | toàn site | Không đo được hiệu quả SEO sau khi triển khai | Xem [GOOGLE_SEARCH_CONSOLE_SETUP.md](GOOGLE_SEARCH_CONSOLE_SETUP.md) | ⏸️ Cần bạn thực hiện (yêu cầu quyền sở hữu tài khoản) |

## Ghi chú quan trọng: đây là dự án học tập

Trang đăng nhập (`src/routes/auth/LoginPage.tsx`) hiển thị công khai tài khoản demo cho mục đích chấm bài ("Tài khoản chấm bài (dành cho giáo viên)"). Đây rõ ràng là một bài tập/đồ án (thư mục dự án tên "Vibe Coding", có file "Bài kiểm tra trắc nghiệm.txt"), không phải cửa hàng thật đang vận hành với dữ liệu khách hàng thật. Audit này vẫn được thực hiện ở tiêu chuẩn production, nhưng điều đó không phải lỗi bảo mật cần xử lý — không đụng vào.

## Bản đồ trang & chỉ định index

| Loại trang | Số lượng | Trong sitemap? | robots meta |
|---|---|---|---|
| Homepage (`/`) | 1 | ✅ | index |
| Danh mục theo audience (`/women`, `/men`, `/unisex`, `/toddler`) | 4 | ✅ | index |
| Collection có nội dung riêng (`/collections/new`, `/collections/best-sellers`) | 2 | ✅ | index (nội dung trùng — xem CRITICAL ở trên) |
| Collection không xác định (`/collections/:slug` khác) | không giới hạn | ❌ | noindex |
| Sản phẩm (`/products/:id`) | 291 | ✅ | index |
| Trang tĩnh (about/materials/help/returns/privacy/terms) | 6 | ✅ | index |
| Tìm kiếm nội bộ (`/search`) | — | ❌ | noindex |
| Giỏ hàng / Checkout | — | ❌ | noindex |
| Tài khoản / Đăng nhập / Đăng ký / Quên-đặt lại mật khẩu | — | ❌ (đồng thời `Disallow: /account/`) | noindex |
| Admin (`/admin/*`) | — | ❌ (đồng thời `Disallow: /admin/`) | noindex |
| 404 | — | ❌ | noindex (nhưng HTTP status vẫn là 200 — xem CRITICAL) |
