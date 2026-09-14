# HORIZ — SEO Implementation

Tài liệu này mô tả **những gì đã được triển khai** trong lần SEO này, kiến trúc metadata, và cách nó vận hành khi thêm sản phẩm/trang mới. Danh sách lỗi ban đầu ở [SEO_AUDIT.md](SEO_AUDIT.md); việc chưa làm và cần quyết định ở [SEO_RECOMMENDATIONS.md](SEO_RECOMMENDATIONS.md).

## Nguyên tắc kiến trúc

HORIZ storefront là **SPA render hoàn toàn phía client** (Vite + React + react-router, deploy tĩnh qua Cloudflare Workers assets — xem `apps/storefront/wrangler.jsonc`). Không có SSR/SSG. Vì vậy:

- Mọi metadata động (title, description, canonical, robots, Open Graph, JSON-LD theo sản phẩm) được set bằng JavaScript sau khi component mount, qua hook `useSeoMeta`.
- Điều này **giúp Googlebot** (crawl 2 pha, có chạy JavaScript) nhưng **không giúp** các bot không chạy JS (một số crawler mạng xã hội, công cụ preview link cũ). Xem khuyến nghị về SSR/prerendering trong SEO_RECOMMENDATIONS.md nếu muốn khắc phục triệt để.
- Hai thực thể **không đổi theo route** (Organization, WebSite) được đặt **tĩnh trong `index.html`** — luôn có mặt trong HTML gốc, không phụ thuộc JS.

## 1. Metadata tập trung — `src/lib/seo.ts`

Hook `useSeoMeta(options)` là điểm duy nhất mọi route dùng để khai báo SEO. Khi mount, nó:

1. Set `document.title`.
2. Cập nhật `<meta name="description">` có sẵn (không tạo trùng).
3. Tạo `<link rel="canonical">` trỏ tới `https://horiz.vn` + `path`.
4. Tạo `<meta name="robots" content="index, follow">` hoặc `"noindex, follow"` tuỳ `noindex`.
5. Cập nhật `og:title`, `og:description`, `og:url` (và `og:image`/`twitter:image` nếu truyền `image`).
6. Chèn JSON-LD (`jsonLd`, 1 object hoặc mảng).
7. **Dọn dẹp khi unmount** — khôi phục title/description/OG về giá trị trước đó, gỡ canonical/robots/JSON-LD — để chuyển route không để lại metadata cũ.

```ts
useSeoMeta({
  title: 'Nữ | HORIZ',
  description: 'Giày và trang phục nhẹ, linh hoạt cho từng chuyển động trong ngày.',
  path: '/women',
  noindex: false, // mặc định
  image: '/catalogue/...jpg', // tuỳ chọn — nếu bỏ qua, giữ nguyên og:image mặc định
  jsonLd: { '@context': 'https://schema.org', '@type': 'Product', ... }, // tuỳ chọn
})
```

Thêm route mới chỉ cần gọi hook này — không cần sửa `index.html` hay file cấu hình nào khác.

## 2. Áp dụng theo từng route

| Route/Component | File | title | noindex | JSON-LD |
|---|---|---|---|---|
| `/` | `src/routes/HomePage.tsx` | Tĩnh, khớp `index.html` mặc định | Không | — (Organization/WebSite đã tĩnh) |
| `/women`, `/men`, `/unisex`, `/toddler`, `/collections/new`, `/collections/best-sellers` | `src/routes/CataloguePage.tsx` | `{Tên danh mục} \| HORIZ` | Không | — |
| `/collections/:slug` khác (không nằm trong danh sách trên) | `src/routes/CataloguePage.tsx` | `Bộ sưu tập \| HORIZ` | **Có** | — |
| `/products/:id` | `src/routes/ProductDetailPage.tsx` | `{Tên sản phẩm} \| HORIZ` | Không (Có nếu id không tồn tại) | `Product` + `BreadcrumbList` |
| `/about`, `/materials`, `/help`, `/returns`, `/privacy`, `/terms` | `src/routes/StaticContentPage.tsx` | `{page.title} \| HORIZ` | Không | — |
| `/search` | `src/routes/SearchPage.tsx` | Động theo từ khóa | **Có** | — |
| `/cart` | `src/routes/CartPage.tsx` | `Giỏ hàng \| HORIZ` | **Có** | — |
| `/checkout` (form + xác nhận) | `src/routes/CheckoutPage.tsx` | `Thanh toán \| HORIZ` / `Đặt hàng thành công \| HORIZ` | **Có** | — |
| `/account/*` | `src/routes/account/AccountPage.tsx` | `Tài khoản của bạn \| HORIZ` | **Có** | — |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | `src/routes/auth/AuthCard.tsx` (dùng chung) | Theo `title` prop của mỗi trang | **Có** | — |
| `/register` (màn hình "kiểm tra email") | `src/routes/auth/RegisterPage.tsx` (`RegisterSuccessNotice`) | `Kiểm tra email của bạn \| HORIZ` | **Có** | — |
| `/admin/*` | `src/routes/admin/AdminLayout.tsx` (áp dụng 1 lần cho toàn bộ layout con) | `Administrator \| HORIZ` | **Có** (cộng thêm `Disallow: /admin/` trong robots.txt) | — |
| `*` (404) | `src/routes/NotFoundPage.tsx` | `Không tìm thấy trang \| HORIZ` | **Có** | — |

## 3. Structured data (JSON-LD)

- **Organization** + **WebSite** (kèm `SearchAction` trỏ `/search?q={search_term_string}`, khớp thật với `SearchPage` đọc `?q=`): đặt tĩnh trong `apps/storefront/index.html` — luôn xuất hiện trên mọi trang kể cả khi JS chưa chạy.
- **Product**: `ProductDetailPage.tsx` — `name`, `description`, `image[]`, `sku` (đã sửa từ id nội bộ sang `product.sku` thật), `category`, `brand`, `offers` (giá VND, `InStock`). Không có `aggregateRating` — hệ thống chưa có review thật, không bịa dữ liệu.
- **BreadcrumbList**: `ProductDetailPage.tsx` — khớp đúng breadcrumb hiển thị (Audience / Category) đã có sẵn trong UI (`pdp-breadcrumb`).

## 4. `robots.txt`

`apps/storefront/public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/

Sitemap: https://horiz.vn/sitemap.xml
```

`/cart`, `/checkout`, `/login`, `/register`, `/search` **không** bị `Disallow` — chúng dùng `noindex` qua meta tag thay vì robots.txt, để Google vẫn crawl được và thấy chỉ định noindex (nếu disallow bằng robots.txt, Google không thấy được thẻ noindex và có thể vẫn index URL rỗng — "Indexed, though blocked by robots.txt"). `/admin/` và `/account/` giữ nguyên disallow vì đây là khu vực yêu cầu đăng nhập, không có giá trị crawl.

## 5. Sitemap — `scripts/build-sitemap.mjs`

Chạy tự động trong `npm run build` (`build:sitemap` trước `build --workspace @horiz/storefront`). Sinh từ dữ liệu thật:

- 13 route tĩnh: `/`, 4 audience, 2 collection có nội dung riêng (`new`, `best-sellers`), 6 trang tĩnh.
- 291 `/products/:id` đọc trực tiếp từ `catalogue.generated.json`.
- **Đã loại `/search`** (noindex) khỏi danh sách route tĩnh.
- Domain lấy từ `SITE_URL` env var, mặc định `https://horiz.vn`.

Khi thêm sản phẩm mới vào `catalogue.generated.json`, sitemap tự cập nhật ở lần build kế tiếp — không cần sửa tay.

## 6. Ảnh & performance

- `apps/storefront/src/routes/HomePage.tsx`: ảnh hero slide đầu giữ `fetchPriority="high"` (đã có sẵn), 3 slide còn lại đổi từ không khai báo sang `fetchPriority="low"` (vẫn tải eager để crossfade mượt, nhưng không cạnh tranh băng thông với ảnh LCP). Ảnh sản phẩm mới/collection/editorial (dưới fold) thêm `loading="lazy"`.
- `apps/storefront/src/routes/ProductDetailPage.tsx`: ảnh chính trong gallery (khả năng cao là phần tử LCP của trang sản phẩm) thêm `fetchPriority="high"`.
- `apps/storefront/public/_headers`: thêm `Cache-Control: public, max-age=604800, must-revalidate` cho `/catalogue/*` và `/prototype/*` (không dùng `immutable` như `/assets/*` vì các file này không có hash trong tên).
- Không đổi bất kỳ style, aspect-ratio, hay kích thước hiển thị nào — chỉ thêm thuộc tính tải ảnh.

## 7. Accessibility + SEO: H1 trên trang danh mục

`CataloguePage.tsx` trước đây không render `<h1>` nào. Đã thêm:

```tsx
<h1 className="sr-only">{content.title} | HORIZ</h1>
```

`sr-only` là class ẩn-trực-quan có sẵn trong `global.css` (dùng cho label ẩn ở nhiều nơi khác trong site) — không có thay đổi hình ảnh nào, nhưng giờ mỗi trang có đúng 1 heading cấp trang cho cả screen reader và search engine.

## 8. Kiểm chứng đã chạy

- `npm run typecheck` — pass, không lỗi.
- `npm run lint` — pass, `--max-warnings 0`.
- `npm run test` — 7 test file, 12 test, pass.
- `npm run build` (bao gồm `build:sitemap`) — build thành công, sitemap sinh 304 URL.
- Kiểm tra trực quan qua dev server (desktop 1280px & mobile 375px) trên: trang chủ, `/women`, `/collections/shoes` (slug không xác định), trang sản phẩm — xác nhận **không có thay đổi giao diện**, đồng thời xác nhận qua `document.title`/`querySelector` rằng title, canonical, robots, JSON-LD hoạt động đúng như thiết kế.
