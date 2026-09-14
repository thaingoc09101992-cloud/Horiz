# HORIZ SEO CHECKLIST

## Technical SEO
- [x] Sitemap (`scripts/build-sitemap.mjs`, tự sinh từ dữ liệu thật, 304 URL)
- [x] Robots.txt (khai báo `Sitemap:`, `Disallow: /admin/`, `/account/`)
- [x] Canonical (mọi route qua `useSeoMeta`)
- [x] HTTPS (đã dùng `https://horiz.vn` xuyên suốt metadata; xác nhận cấu hình domain thật do bạn quản lý)
- [x] 404 UI đúng ngữ nghĩa + `noindex` (⏸️ HTTP status vẫn 200 — hạn chế kiến trúc, xem SEO_RECOMMENDATIONS.md #1)
- [ ] Redirect strategy — không áp dụng (chưa có URL nào cần đổi trong đợt này)
- [x] Noindex cho trang không có giá trị tìm kiếm (cart/checkout/account/auth/admin/search/collection không xác định)

## On-page SEO
- [x] Dynamic title theo route (`src/lib/seo.ts`)
- [x] Meta description theo route
- [x] H1 duy nhất mỗi trang (đã bổ sung cho trang danh mục, dùng `sr-only` để không đổi giao diện)
- [x] Image alt text có ý nghĩa (đã kiểm tra — alt hiện tại mô tả đúng sản phẩm/ngữ cảnh, không cần sửa)
- [x] `lang="vi"` trên `<html>`
- [ ] SEO copy mở rộng cho trang danh mục — cần bạn duyệt nội dung (SEO_RECOMMENDATIONS.md #8)

## Structured Data
- [x] Organization (tĩnh trong `index.html`)
- [x] WebSite + SearchAction (tĩnh trong `index.html`)
- [x] Product (đã sửa lỗi `sku`)
- [x] Offer (trong Product schema — giá, `InStock`)
- [x] BreadcrumbList (trang sản phẩm, khớp breadcrumb UI thật)
- [ ] BreadcrumbList cho trang danh mục — cần thêm breadcrumb UI trước (SEO_RECOMMENDATIONS.md #4)
- [ ] AggregateRating — chưa có dữ liệu review thật, không bịa (đúng nguyên tắc)

## Performance / Core Web Vitals
- [x] `fetchPriority="high"` cho ảnh LCP (hero slide đầu, ảnh chính PDP)
- [x] `fetchPriority="low"` cho ảnh hero không hiển thị ngay
- [x] `loading="lazy"` cho ảnh dưới fold (trang chủ)
- [x] CLS — đã kiểm tra, `aspect-ratio` CSS đã kiểm soát tốt trên toàn site
- [x] Font — đã tối ưu sẵn (self-host, `font-display: swap`, subset tiếng Việt)
- [x] Cache-Control cho ảnh tĩnh (`/catalogue/*`, `/prototype/*`)
- [ ] Code-splitting sâu hơn cho bundle chính (~631 KB) — cần rà soát kỹ, xem SEO_RECOMMENDATIONS.md #5

## E-commerce SEO
- [x] Product page: title/description/canonical/schema riêng theo sản phẩm
- [x] Category page: title/description/canonical/H1 riêng theo danh mục
- [x] Ngăn duplicate content từ `/collections/:slug` không xác định (noindex + loại khỏi sitemap)
- [ ] Lọc thật theo category cho menu "Giày/Trang phục/Phụ kiện" — cần bạn duyệt (SEO_RECOMMENDATIONS.md #3)
- [ ] Dữ liệu thật cho "Sản phẩm mới"/"Best sellers" — cần bạn quyết định nguồn dữ liệu (SEO_RECOMMENDATIONS.md #2)

## Đo lường & vận hành
- [ ] Google Search Console setup — xem [GOOGLE_SEARCH_CONSOLE_SETUP.md](GOOGLE_SEARCH_CONSOLE_SETUP.md)
- [ ] Google Analytics 4 — chưa có, cần bạn quyết định (SEO_RECOMMENDATIONS.md #7)

## Validation đã chạy
- [x] `npm run typecheck` — pass
- [x] `npm run lint` — pass (`--max-warnings 0`)
- [x] `npm run test` — 12/12 test pass
- [x] `npm run build` (kèm `build:sitemap`) — thành công
- [x] Visual regression thủ công qua browser (desktop 1280px, mobile 375px) trên trang chủ / danh mục / sản phẩm — không phát hiện thay đổi giao diện
