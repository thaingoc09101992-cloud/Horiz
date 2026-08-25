# Đặc tả trang quản trị HORIZ

## 1. Mục tiêu

Cung cấp một back office đồng bộ phong cách HORIZ để admin quản lý hàng hóa, tồn kho, giá, chiết khấu, đơn hàng và thành viên mà không cần thao tác trực tiếp trong Supabase.

## 2. Truy cập và phân quyền

- Dùng chung Supabase Auth với storefront, không xây tài khoản admin riêng.
- Người dùng tự đăng ký luôn nhận role `customer`.
- Sau khi đăng nhập, chỉ user có role `admin` mới thấy link `Administrator` trong menu tài khoản.
- Link dẫn tới `/admin/dashboard`. User chưa đăng nhập được đưa về `/login?returnTo=/admin`; user đã đăng nhập nhưng không có quyền nhận 403.
- Mọi API/bảng admin kiểm tra permission phía server và RLS. DevTools hoặc nhập URL trực tiếp không được vượt quyền.

Permission đề xuất:

| Permission | Staff | Admin |
|---|---:|---:|
| Xem catalogue/tồn/đơn | Có | Có |
| Sửa sản phẩm, giá, tồn | Theo cấp | Có |
| Tạo chiết khấu | Theo cấp | Có |
| Xử lý/refund đơn | Theo hạn mức | Có |
| Quản lý thành viên thường | Theo cấp | Có |
| Cấp/thu hồi role admin | Không | Có |
| Xem audit log | Hạn chế | Có |

## 3. Sitemap

```text
/admin
├── /dashboard
├── /products
│   ├── /new
│   └── /:id
├── /inventory
├── /pricing
├── /discounts
│   ├── /new
│   └── /:id
├── /orders/:id?
├── /members/:id?
├── /collections
├── /content
└── /audit-logs
```

## 4. Module chức năng

### Dashboard

Dashboard là trang mặc định sau đăng nhập admin và phục vụ hai quyết định: tình hình bán hàng đang diễn biến thế nào, và SKU nào cần xử lý tồn kho ngay.

- KPI chính: doanh thu thuần, số đơn đã thanh toán, giá trị đơn trung bình.
- KPI tồn kho: giá trị tồn, SKU hết hàng, SKU sắp hết, hàng tồn chậm và hàng đang reserve.
- Biểu đồ: xu hướng doanh thu/đơn; cơ cấu trạng thái đơn; top sản phẩm; tồn kho theo category; biến động nhập/xuất.
- Danh sách hành động: đơn chờ xử lý, thanh toán lỗi, SKU hết/sắp hết, reservation quá hạn, sản phẩm bán chạy nhưng tồn thấp.
- Bộ lọc: thời gian, category, collection và kênh bán khi có nhiều kênh; mặc định 30 ngày, Asia/Ho_Chi_Minh.
- So sánh kỳ trước dùng khoảng thời gian có cùng số ngày; mọi drill-down giữ filter hiện hành.
- Mỗi KPI phải có định nghĩa, nguồn dữ liệu, thời điểm cập nhật và tooltip; chi tiết nằm trong `DASHBOARD_KPI_SPEC.md`.

### Sản phẩm

- Tạo/sửa/duplicate/archive sản phẩm, variant, option, SKU, category, collection, ảnh, SEO và trạng thái draft/published/archived.
- Không hard delete sản phẩm đã xuất hiện trong đơn; dùng archive/unpublish.
- Preview storefront trước publish; bulk publish/archive có xác nhận.

### Tồn kho

- Xem on-hand, reserved, available theo SKU; filter hết/sắp hết.
- Điều chỉnh nhập/xuất/hỏng/kiểm kê kèm lý do; không sửa trực tiếp số available.
- Lịch sử movement bất biến, hiển thị actor, thời gian và reference.

### Giá bán

- Sửa giá theo SKU hoặc bulk; hiển thị VND dạng dễ đọc nhưng lưu bigint.
- Preview thay đổi và cảnh báo giá bán thấp hơn/khác thường.
- Ghi price history; đơn cũ giữ snapshot giá.

### Chiết khấu

- Kiểu: phần trăm hoặc số tiền cố định; coupon hoặc tự động.
- Target: toàn shop, category, collection, product hoặc variant.
- Thiết lập bắt đầu/kết thúc, múi giờ, min order, giới hạn lượt dùng, giới hạn mỗi thành viên, stackable và priority.
- Trạng thái: draft/scheduled/active/paused/expired; preview sản phẩm bị tác động và xung đột trước khi lưu.

### Đơn hàng

- Search theo mã đơn/email/SĐT; filter status/payment/date.
- Timeline đơn, item snapshot, địa chỉ, payment, shipment và audit.
- Cho phép xác nhận, processing, shipped/tracking, cancel và refund theo quyền; thao tác nhạy cảm cần confirm và lý do.

### Thành viên

- Danh sách, search, trạng thái xác minh, ngày tham gia, số đơn, tổng chi tiêu.
- Xem hồ sơ, địa chỉ và đơn theo phạm vi hỗ trợ; che bớt PII khi không cần.
- Khóa/mở khóa, gửi reset password/invite qua luồng server; không xem hoặc đặt mật khẩu thay user.
- Chỉ admin có permission cao nhất mới cấp/thu hồi staff/admin; mọi thay đổi role ghi audit.

## 5. UX và visual

- Chung palette, logo, `Cormorant SC` cho heading thương hiệu và `Inter` cho bảng/form.
- Light/dark và full screen như storefront.
- Desktop sidebar; mobile drawer; nội dung ưu tiên bảng và form dễ quét.
- Bảng có sticky header, column visibility, filter, pagination và export CSV theo quyền.
- Autosave không dùng cho thay đổi giá, tồn kho, role, discount hoặc order status; phải bấm lưu/xác nhận rõ ràng.

## 6. Audit và an toàn

- Ghi before/after cho product, price, inventory, promotion, order và member role/status.
- Không log token, password, payment secret hoặc PII không cần thiết.
- Rate limit thao tác bulk/export; chống CSRF/origin abuse theo kiến trúc auth thực tế.
- Phiên admin nhạy cảm có thể yêu cầu xác thực lại; role bị thu hồi phải được phản ánh sau token refresh và kiểm tra server.

## 7. Acceptance criteria

- Customer không thấy link và không gọi được API admin.
- Admin hoàn thành mỗi tác vụ chính trên cả desktop/mobile, sáng/tối.
- Promotion tự active/expire đúng mốc thời gian, không cần mở dashboard.
- Hai admin sửa cùng record không âm thầm ghi đè; cảnh báo version conflict.
- Mọi thay đổi quan trọng truy vết được từ audit log.
- Dashboard tải được skeleton trước dữ liệu, hiển thị thời điểm cập nhật và không biến dữ liệu thiếu thành số 0.
- KPI tổng và drill-down khớp khi dùng cùng bộ lọc; timezone, trạng thái hủy/refund và đơn test được xử lý nhất quán.
