# HORIZ — Google Search Console Setup Checklist

Hướng dẫn từng bước để đưa website lên Google sau khi các thay đổi SEO trong đợt này đã được deploy lên production (`https://horiz.vn`). Tôi không thể tự thực hiện các bước này vì cần quyền sở hữu tài khoản Google/domain của bạn.

## 1. Thêm property

1. Vào [Google Search Console](https://search.google.com/search-console).
2. Chọn **Add property**.
3. Ưu tiên loại **Domain property** (`horiz.vn`) thay vì URL-prefix — domain property gộp cả `http`/`https`, `www`/non-`www` vào một chỗ theo dõi, phù hợp vì site chỉ có một canonical domain (`https://horiz.vn`, theo cấu hình OG/canonical đã triển khai).

## 2. Verify domain

Domain property yêu cầu verify qua **DNS TXT record**:

1. Search Console cung cấp một TXT record dạng `google-site-verification=...`.
2. Thêm record này vào DNS của `horiz.vn` (tại nhà cung cấp domain/DNS đang dùng, ví dụ Cloudflare DNS nếu domain đã trỏ vào Cloudflare cho phần Workers deploy).
3. Đợi DNS propagate (thường vài phút đến vài giờ) rồi bấm **Verify** trong Search Console.

*Nếu muốn verify nhanh hơn cho URL-prefix property thay vì domain property*: có thể dùng phương thức **HTML file** hoặc **meta tag** — nhưng vì đây là SPA tĩnh, file HTML upload vào `apps/storefront/public/` sẽ tự động được serve đúng đường dẫn khi build; cho tôi biết nếu bạn muốn đi hướng này thay vì DNS.

## 3. Submit sitemap

1. Trong Search Console, vào **Sitemaps** (menu bên trái).
2. Nhập `sitemap.xml` (không cần URL đầy đủ, chỉ path) và bấm **Submit**.
3. Sitemap được sinh tự động ở mỗi lần `npm run build` (script `build:sitemap`) và hiện có 304 URL (13 route tĩnh + 291 sản phẩm) — không cần cập nhật tay khi thêm sản phẩm mới, chỉ cần deploy lại.

## 4. Request indexing cho các trang quan trọng

Sau khi sitemap được crawl lần đầu (có thể mất vài ngày), dùng **URL Inspection** để request index thủ công cho các trang ưu tiên cao nếu muốn đẩy nhanh:
- Trang chủ `/`
- 4 trang danh mục theo audience (`/women`, `/men`, `/unisex`, `/toddler`)
- Một vài sản phẩm bán chạy nhất (nếu biết)

## 5. Kiểm tra Pages (Coverage)

Vào **Indexing → Pages** để theo dõi:
- **Đã lập chỉ mục**: nên tăng dần khớp với 304 URL trong sitemap.
- **Đã crawl - hiện chưa lập chỉ mục**: bình thường trong vài tuần đầu.
- **Bị loại trừ do thẻ 'noindex'**: nên thấy các URL `/cart`, `/checkout`, `/search`, `/account/*`, `/login`, `/register`, `/admin/*` xuất hiện ở đây — đây là **kết quả đúng như thiết kế**, không phải lỗi.
- Nếu thấy nhiều URL `/collections/:slug` lạ bị "Đã lập chỉ mục dù bị chặn bởi robots.txt" hoặc tương tự — kiểm tra lại vì các slug không xác định đã được đánh `noindex` (không phải `disallow`), nên đúng ra phải hiện ở mục "Bị loại trừ do thẻ noindex".

## 6. Kiểm tra Core Web Vitals

Vào **Experience → Core Web Vitals**. Cần dữ liệu thực tế người dùng (CrUX) tích lũy vài tuần mới có số liệu đủ tin cậy. Trong lúc chờ, dùng [PageSpeed Insights](https://pagespeed.web.dev/) nhập `https://horiz.vn` và `https://horiz.vn/products/<một-sản-phẩm>` để lấy Lighthouse score tức thời — hai loại trang này đại diện cho traffic cao nhất (trang chủ + PDP).

## 7. Kiểm tra Rich Results (Structured Data)

Dùng [Rich Results Test](https://search.google.com/test/rich-results) kiểm tra:
- `https://horiz.vn/` — phải thấy `Organization` + `WebSite` (có `SearchAction` cho Sitelinks Search Box).
- `https://horiz.vn/products/<id>` — phải thấy `Product` (với `offers`, `sku` đúng) + `BreadcrumbList`.

Search Console cũng có báo cáo **Enhancements → Products / Breadcrumbs** riêng, sẽ tự điền dữ liệu sau khi Google crawl lại các trang sản phẩm.

## 8. Liên kết Google Analytics 4 (nếu triển khai)

Site hiện chưa có GA4 hoặc tracking script nào (xem [SEO_RECOMMENDATIONS.md](SEO_RECOMMENDATIONS.md) mục 7). Nếu bạn tạo GA4 property, có thể liên kết trực tiếp với Search Console property tại **Settings → Associations** trong Search Console để xem dữ liệu Search Console ngay trong GA4.
