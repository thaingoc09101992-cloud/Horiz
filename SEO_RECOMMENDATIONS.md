# HORIZ — SEO Recommendations (cần bạn quyết định)

Đây là những việc **không được tự động thực hiện** vì chúng ảnh hưởng đến UI, business logic, dữ liệu sản phẩm, hoặc kiến trúc deploy — theo đúng nguyên tắc đã thống nhất. Mỗi mục nêu rõ lợi ích, đánh đổi và phương án.

## 1. 🔴 SPA fallback trả HTTP 200 cho URL không tồn tại (thay vì 404 thật)

**Hiện trạng:** `wrangler.jsonc` cấu hình `not_found_handling: "single-page-application"` — comment trong file ghi rõ đây là lựa chọn có chủ đích ("pure static build, nothing runs server-side") để tránh một bug đã biết của Cloudflare khi dùng `_redirects` (cloudflare/workers-sdk#11824). Mọi URL sai đều render `NotFoundPage` (đã có `noindex` sau đợt sửa này) nhưng HTTP status vẫn là `200`.

**Vì sao đáng cân nhắc:** Google Search Console sẽ có thể báo cáo các URL rác là "Đã lập chỉ mục" hoặc "Trùng lặp" thay vì "Không tìm thấy (404)" rõ ràng — khó theo dõi hơn, dù `noindex` đã giảm phần lớn rủi ro bị index thật.

**Phương án nếu muốn xử lý triệt để:**
- **A. Thêm Worker script** (`"main"` trong `wrangler.jsonc`) chỉ để set status 404 cho request không khớp asset/route đã biết trước khi serve `index.html`. Đánh đổi: không còn là "pure static build" nữa — cần chạy code phía server (Workers runtime), tăng độ phức tạp deploy.
- **B. Chấp nhận hiện trạng** — với quy mô 291 sản phẩm và không có URL người dùng tự nhập thường xuyên, rủi ro thực tế thấp; `noindex` đã đủ để tránh index sai.

Khuyến nghị: nếu không có kế hoạch mở rộng nhiều loại trang động khác, phương án B (giữ nguyên, đã có noindex) hợp lý. Cho tôi biết nếu muốn triển khai phương án A.

## 2. 🔴 `/collections/new` và `/collections/best-sellers` trùng nội dung (đều hiện toàn bộ 291 sản phẩm)

**Hiện trạng:** Dữ liệu sản phẩm (`catalogue.generated.json`) không có field đánh dấu "sản phẩm mới" hay số liệu bán hàng, nên `CataloguePage` không có gì để lọc theo — hai trang chỉ khác tiêu đề/mô tả, nội dung sản phẩm bên dưới giống hệt nhau và giống cả trang chủ.

**Phương án:**
- **A. Thêm field dữ liệu thật** — ví dụ `createdAt`/`isNew` cho "sản phẩm mới" (lọc theo N ngày gần nhất), và một nguồn số liệu bán hàng thật (từ Supabase `orders`/`order_items`) cho "best sellers". Đây là quyết định về dữ liệu/sản phẩm, không phải kỹ thuật SEO thuần túy.
- **B. Gộp 2 trang thành 1 hoặc bỏ bớt** nếu không có ý định phân biệt thật giữa "mới" và "bán chạy".
- **C. Giữ nguyên nhưng chấp nhận rủi ro** thấp vì đây chỉ là 2/304 URL trong sitemap.

Khuyến nghị: nếu có dữ liệu đơn hàng thật trong Supabase (đã thấy bảng `orders`, `order_items` qua `AdminDashboardPage`), phương án A khả thi và nên làm — cho tôi biết nếu muốn tôi triển khai logic lọc dựa trên dữ liệu đó.

## 3. 🟠 Mega menu quảng cáo "Giày", "Trang phục", "Tất & phụ kiện" nhưng không lọc thật theo category

**Hiện trạng:** `StorefrontLayout.tsx` có menu "Theo danh mục" trỏ tới `/collections/shoes`, `/collections/apparel`, `/collections/accessories` — nhưng `CataloguePage` chưa có logic map các slug này sang `product.category` (`Shoes`/`Apparel`/`Socks`/`Underwear` đã có sẵn trong dữ liệu). Kết quả: click "Giày" hiện tất cả sản phẩm mọi loại, không chỉ giày — đây vừa là lỗi UX vừa là nguyên nhân duplicate content ở mục audit CRITICAL đầu tiên.

**Vì sao tôi không tự sửa:** dù dữ liệu `product.category` đã có sẵn, việc thêm bộ lọc này **thay đổi sản phẩm hiển thị cho người dùng thật** trên 3 URL đang được quảng bá trong menu chính — đây là thay đổi hành vi/UI cần bạn xác nhận, không thuần là "chỉnh crawl directive".

**Đề xuất cụ thể** (nếu bạn đồng ý, tôi có thể triển khai ngay): thêm 3 entry vào `pageContent` trong `CataloguePage.tsx` map `shoes → category: 'Shoes'`, `apparel → category: 'Apparel'`, `accessories → category: 'Socks'` (gộp `Underwear` nếu phù hợp) tương tự cách `audience` đang lọc cho women/men/unisex/toddler — cùng một pattern, rủi ro thấp, và giải quyết luôn vấn đề duplicate content ở mục 2 của SEO_AUDIT.

## 4. 🟡 Breadcrumb hiển thị (UI) cho trang danh mục

**Hiện trạng:** Chỉ trang sản phẩm có breadcrumb UI (`pdp-breadcrumb`). Trang danh mục không có, nên tôi không thêm `BreadcrumbList` schema ở đó (schema phải khớp nội dung hiển thị thật).

**Đề xuất:** nếu bạn muốn, thêm breadcrumb nhỏ (`Trang chủ / {Audience}`) phía trên tiêu đề danh mục — vừa cải thiện điều hướng UX vừa cho phép thêm `BreadcrumbList` schema hợp lệ. Đây là thay đổi giao diện (dù nhỏ) nên cần bạn duyệt trước.

## 5. 🟡 Bundle JavaScript chính ~631 KB (147 KB gzip)

**Hiện trạng:** Build cảnh báo chunk `index-*.js` vượt 500 KB. Phần lớn route đã lazy-load (`SearchPage`, `CataloguePage`, `ProductDetailPage`, `CartPage`, `CheckoutPage`, toàn bộ Admin), nhưng `HomePage` + `StorefrontLayout` + các thư viện nền (`react`, `react-router`, `@supabase/supabase-js`, `lucide-react`) nằm trong bundle chính vì được import eager (hợp lý vì Home thường là trang vào đầu tiên).

**Đề xuất (không tự triển khai vì cần rà soát runtime kỹ, rủi ro phá vỡ hành vi):**
- Kiểm tra import `lucide-react` — dùng named import trực tiếp từng icon (đã làm) là đúng cách, nhưng nên xác nhận tree-shaking hoạt động đúng qua `vite build --mode analyze` hoặc plugin `rollup-plugin-visualizer`.
- Cân nhắc tách `@supabase/supabase-js` thành chunk riêng nếu không cần ở lần render đầu (nhiều phần dùng Supabase là tương tác sau — wishlist, newsletter — có thể lazy-init).

## 6. 🟢 Preload font chính

Font đã tối ưu tốt (self-host, `font-display: swap`, subset tiếng Việt) — không có FOIT/FOUT. Có thể thêm `<link rel="preload" as="font">` cho weight 400 để giảm thời gian render text đầu tiên, nhưng vì Vite hash tên file font lúc build, cần một Vite plugin nhỏ để tự động chèn đúng tên file — không làm thủ công trong `index.html` (dễ sai tên sau mỗi lần build). Ưu tiên thấp vì lợi ích biên nhỏ so với hiện trạng đã tốt.

## 7. Google Analytics 4

Không tìm thấy GA4 hoặc bất kỳ tracking script nào trong source. Đây là quyết định của bạn (có muốn theo dõi traffic hay không, dùng GA4 hay công cụ khác) — không tự thêm ID giả. Nếu muốn triển khai, cho tôi biết Measurement ID thật và tôi sẽ thêm đúng cách (không ảnh hưởng performance, dùng `gtag.js` với `async`).

## 8. Nội dung SEO copy cho trang danh mục

Theo yêu cầu ban đầu, tôi không tự viết thêm nội dung SEO-copy (đoạn văn giới thiệu dài ở đầu/cuối trang danh mục) vì đó là thay đổi nội dung hiển thị. Nếu muốn, đây là hạng mục điển hình các site thời trang lớn dùng để tăng nội dung text cho trang category (đặt cuối trang, dưới lưới sản phẩm, không ảnh hưởng bố cục chính) — cho tôi biết nếu muốn tôi soạn thảo để bạn duyệt nội dung trước khi chèn.

## 9. Backlink / editorial content / keyword research

Nằm ngoài phạm vi kỹ thuật của source code — đây là hoạt động marketing/content dài hạn, không thể "tự động sinh" mà không có rủi ro spam (đúng nguyên tắc đã nêu ở đầu). Khuyến nghị chung: viết bài blog/lookbook thật (hiện site chưa có blog) gắn với các danh mục sản phẩm chính, xây liên kết tự nhiên từ các kênh có kiểm soát (mạng xã hội thương hiệu, đối tác).
