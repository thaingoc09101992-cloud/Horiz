# Quy tắc nghiệp vụ

## Catalogue

- `product` là mẫu chung; `variant` là tổ hợp bán được (màu + size) và có SKU duy nhất.
- Slug là duy nhất, chữ thường, không dấu; slug cũ được giữ trong bảng redirect.
- Một sản phẩm chỉ được công khai khi có tên, mô tả ngắn, category, giá hợp lệ, ít nhất một ảnh và một variant active.
- Giá bán không âm; `compare_at_price` phải lớn hơn `price`.

## Tiền tệ

- Lưu giá bằng `bigint` theo đơn vị nhỏ nhất. Với VND: 2.499.000₫ lưu `2499000`.
- Server là nguồn sự thật về giá. Snapshot tên/SKU/giá được ghi vào `order_items`.
- Manifest hiện có cả USD và VND; import MVP dùng VND, USD chỉ giữ làm dữ liệu nguồn.

## Tồn kho

- `available = on_hand - reserved`; không được âm.
- Tạo checkout sẽ reserve tồn trong thời gian cấu hình; thanh toán thành công chuyển reserve thành sold.
- Hết hạn/thất bại hoàn reserve. Mọi thay đổi ghi `inventory_movements`.
- Cập nhật tồn dùng transaction và khóa hàng để tránh oversell.

## Giỏ hàng

- Guest cart dùng ID ngẫu nhiên và có hạn; khi đăng nhập merge theo SKU.
- Số lượng tối thiểu 1, tối đa theo tồn và giới hạn mua cấu hình.
- Giá hiển thị trong giỏ chỉ là ước tính cho đến khi server xác nhận checkout.
- Prototype Phase 2 lưu guest cart trong `localStorage` với key `horiz-cart-v1`; chưa thay thế quy tắc cart server-side ở Phase 3.
- Người mua phải chọn size trước khi thêm. Cùng sản phẩm và cùng size được gộp số lượng; khác size là hai dòng riêng.
- Ngưỡng miễn phí vận chuyển đang hiển thị là 1.500.000₫; phải chuyển thành cấu hình được admin quản lý trước production.

## Đơn hàng và thanh toán

- Trạng thái đơn: `pending_payment → paid → processing → shipped → delivered`.
- Nhánh kết thúc: `cancelled`, `refunded`, `partially_refunded`.
- Webhook đã xác thực chữ ký là nguồn quyết định trạng thái thanh toán.
- Mỗi event có `provider_event_id` duy nhất để chống xử lý lặp.
- Số đơn sinh ở server, không dùng UUID làm mã hiển thị.
- COD MVP yêu cầu thành viên đã đăng nhập; database tính lại giá, khóa tồn và reserve hàng trong 7 ngày. Đơn khởi tạo ở `pending_payment`/`pending` cho đến khi quy trình thu tiền COD được xác nhận.
- COD MVP tạm miễn phí vận chuyển cho mọi đơn. Chính sách này phải chuyển sang bảng cấu hình/phí hãng vận chuyển trước production.

## Khuyến mãi

- Coupon có thời gian, số lượt, min order và phạm vi sản phẩm/category.
- Không cộng dồn mặc định; cấu hình rõ promotion nào stack được.
- Discount không làm tổng hàng hóa âm; phí ship và thuế tính theo thứ tự đã cấu hình.
- Thời gian lưu `timestamptz`; màn hình admin hiển thị múi giờ Asia/Ho_Chi_Minh và ghi rõ múi giờ.
- Trạng thái suy ra: draft, scheduled, active, expired, paused; chỉ promotion active và nằm trong `[starts_at, ends_at)` mới áp dụng.
- Thay đổi chiết khấu không sửa giá snapshot của đơn đã đặt.
- Trước khi kích hoạt phải hiển thị preview phạm vi sản phẩm và xung đột với promotion khác.

## Đổi trả

- Chính sách HORIZ phải được chủ dự án duyệt trước launch; không mặc định sao chép mốc 30 ngày của Allbirds.
- Sản phẩm vệ sinh cá nhân/đồ lót và hàng final sale cần điều kiện riêng.
- Refund chỉ được thực hiện server-side và ghi audit log.

## Phân quyền

- Customer chỉ đọc/sửa dữ liệu thuộc chính họ.
- Tài khoản tự đăng ký luôn là `customer`; chỉ admin hiện hữu mới cấp/thu hồi quyền staff/admin qua API đặc quyền.
- Staff không chỉnh role, thành viên admin hoặc cấu hình bảo mật.
- Admin action nhạy cảm phải ghi actor, action, entity, before/after, timestamp.
- Role dùng `app_metadata`/bảng membership do server quản lý, không dùng `user_metadata`.
- Link `Administrator` chỉ là điều kiện hiển thị UX. Route, API, bảng và Storage vẫn bắt buộc kiểm tra quyền phía server/RLS.
- Khi khóa thành viên, phải thu hồi hoặc vô hiệu hóa phiên phù hợp; xóa user không được xem là tự động làm token đang tồn tại mất hiệu lực.
