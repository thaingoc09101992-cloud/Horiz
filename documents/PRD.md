# PRD — HORIZ Commerce MVP

## 1. Mục tiêu sản phẩm

Tạo storefront bán hàng có tốc độ cao, hình ảnh đẹp, mua sắm thuận tiện trên mobile và quản lý catalogue/tồn kho bằng Supabase.

## 2. Người dùng

- Khách vãng lai: xem, tìm, lọc, thêm giỏ, checkout.
- Thành viên: tự đăng ký, xác minh email, lưu địa chỉ, xem đơn, wishlist.
- Nhân viên: xem và xử lý đơn, điều chỉnh tồn.
- Admin: quản lý toàn bộ catalogue, nội dung và phân quyền.

## 3. Sitemap MVP

```text
/
├── /men, /women, /unisex, /kids
├── /collections/:slug
├── /products/:slug
├── /search
├── /cart
├── /checkout
├── /order/success/:orderNumber
├── /account
│   ├── /register, /login, /forgot-password
│   ├── /orders
│   ├── /addresses
│   └── /wishlist
├── /about, /materials, /help, /returns, /privacy, /terms
└── /admin
    ├── /dashboard
    ├── /products, /inventory, /pricing, /discounts
    ├── /orders, /members, /collections
    └── /content, /audit-logs
```

## 4. Yêu cầu chức năng

### P0 — bắt buộc

- Header responsive, mega menu desktop, drawer mobile, search overlay.
- Homepage CMS-driven với hero, collection tiles, carousel và brand story.
- PLP có filter category/gender/size/color/price, sort, pagination hoặc load more.
- PDP có gallery, màu, size, giá, tồn, size guide, add to cart, related products.
- Giỏ hàng bền vững qua reload; đồng bộ khi đăng nhập.
- Checkout địa chỉ, giao hàng, thanh toán, xác nhận đơn.
- Supabase Auth: tự đăng ký thành viên bằng email/password, xác minh email, đăng nhập, magic link tùy chọn và đặt lại mật khẩu.
- Tài khoản: hồ sơ, địa chỉ và lịch sử đơn.
- Admin: CRUD sản phẩm/variant; quản lý giá bán, tồn kho, chiết khấu và khoảng thời gian áp dụng; xử lý đơn; quản lý thành viên; xem audit log.
- Dashboard admin theo dõi doanh thu/đơn hàng và sức khỏe tồn kho theo thời gian, có so sánh kỳ trước, drill-down và cảnh báo cần xử lý.
- Link `Administrator` chỉ render khi phiên đăng nhập đã được server/RLS xác nhận có quyền admin. Người chưa đăng nhập dùng luồng đăng nhập thành viên chung; đăng nhập thành công mới hiện link.
- Mọi route `/admin/*` và API quản trị phải kiểm tra quyền độc lập; việc ẩn link không phải cơ chế bảo mật.
- SEO metadata, sitemap, robots, canonical và dữ liệu Product có cấu trúc.
- Chế độ sáng/tối và nút toàn màn hình trong header/utilities.

### P1 — ngay sau MVP

- Wishlist, review, coupon, recently viewed, email giao dịch.
- Import catalogue từ CSV có dry-run và báo lỗi.
- Dashboard doanh thu/tồn kho.

### P2 — mở rộng

- Đa ngôn ngữ/tiền tệ, loyalty, gift card, personalization.

## 5. User stories và acceptance criteria chính

### Chọn biến thể

Là khách mua hàng, tôi muốn chọn màu và size để biết chính xác SKU còn hàng.

- Chỉ combination tồn tại mới chọn được.
- Size hết hàng bị disabled nhưng vẫn nhìn thấy.
- CTA không hoạt động khi chưa chọn đủ option và có hướng dẫn cụ thể.

### Thêm giỏ

- Add thành công mở cart drawer và announce bằng `aria-live`.
- Cùng SKU cộng số lượng, không tạo dòng trùng.
- Không cho số lượng vượt tồn khả dụng.

### Đặt hàng

- Server tính lại giá, giảm giá, phí giao hàng và tồn trước khi tạo payment.
- Không tin tổng tiền do client gửi lên.
- Refresh/callback lặp không tạo đơn hoặc giao dịch trùng.

### Đăng ký thành viên

- Email được chuẩn hóa và không tạo hai tài khoản trùng.
- Sau đăng ký, người dùng nhận email xác minh và chưa được sử dụng chức năng yêu cầu xác minh cho đến khi hoàn tất.
- Tài khoản mới luôn có vai trò `customer`; client không được gửi hoặc tự chọn vai trò.
- Đăng nhập/đăng ký có rate limit, thông báo lỗi không làm lộ tài khoản có tồn tại hay không.

### Truy cập quản trị

- Customer không nhìn thấy link `Administrator`.
- Admin đã đăng nhập nhìn thấy link trong menu tài khoản và được chuyển đến `/admin/dashboard`.
- Truy cập trực tiếp `/admin` khi chưa đăng nhập chuyển tới `/login?returnTo=/admin`; đã đăng nhập nhưng không có quyền trả trang 403.
- Quyền admin bị thu hồi phải mất hiệu lực sau khi token được refresh; thao tác nhạy cảm có thể yêu cầu xác thực lại.

### Dashboard bán hàng và tồn kho

- Bộ lọc thời gian: hôm nay, 7 ngày, 30 ngày, tháng này, khoảng tùy chọn; mặc định 30 ngày và múi giờ Asia/Ho_Chi_Minh.
- KPI bán hàng gồm doanh thu thuần, số đơn đã thanh toán và giá trị đơn trung bình; so sánh cùng độ dài kỳ liền trước.
- Biểu đồ doanh thu và đơn hàng theo ngày; breakdown theo trạng thái đơn và top sản phẩm/collection.
- KPI tồn kho gồm giá trị tồn, SKU hết hàng, SKU sắp hết, hàng tồn chậm và số lượng đang reserve.
- Danh sách cảnh báo có hành động trực tiếp tới đơn cần xử lý, SKU cần nhập hoặc promotion bất thường.
- Mọi KPI có tooltip định nghĩa; drill-down phải giữ nguyên bộ lọc thời gian.

## 6. Phi chức năng

- Responsive từ 320 px; desktop content max-width nhất quán.
- Ảnh AVIF/WebP, responsive `srcset`, lazy load ngoài viewport.
- Test: unit cho pricing/cart, integration cho RLS/order, E2E cho purchase path.
- Error monitoring, Web Analytics và log có request ID; không log dữ liệu thẻ.
- Backup, migration và rollback được mô tả trong DEPLOYMENT.

## 7. Ngoài phạm vi MVP

Marketplace nhiều nhà bán, ERP/WMS đầy đủ, loyalty nâng cao, native app, recommendation AI và đa kho phức tạp.
