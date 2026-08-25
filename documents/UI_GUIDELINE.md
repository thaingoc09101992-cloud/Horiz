# Hướng dẫn UI/UX

## Nguyên tắc

1. Sản phẩm là nhân vật chính; chrome UI gọn và trung tính.
2. Mỗi viewport có một hành động chính rõ nhất.
3. Không ẩn phí, tự tick add-on hoặc tạo khan hiếm giả.
4. Mọi chức năng dùng được bằng bàn phím, screen reader và touch.

## Layout responsive

| Kích thước | Grid PLP | PDP |
|---|---:|---|
| 320–639 | 2 cột | Gallery → buy box |
| 640–1023 | 2–3 cột | Gallery → buy box |
| 1024–1439 | 4 cột | Gallery 60% + sticky buy box 40% |
| ≥1440 | 4 cột | Max-width 1600 px |

## Các trang chủ đạo

### Header

- Announcement bar tối đa 1 thông điệp.
- Desktop: menu trái, logo giữa, search/account/cart phải.
- Mobile: menu, logo, search/cart; tap target tối thiểu 44×44 px.
- Có switch sáng/tối và nút toàn màn hình; full screen dùng Fullscreen API, ẩn/disable khi trình duyệt không hỗ trợ.
- Khi admin đã đăng nhập, menu tài khoản có link chữ `Administrator`; customer và khách không render link này.

### Homepage

- Hero đầu trang dùng ảnh art-directed desktop/mobile, headline ngắn, tối đa 2 CTA.
- Section cách nhau rộng; xen kẽ product rail và editorial image.
- Carousel có nút prev/next, scroll-snap, không auto-play.

### Product listing

- Hiển thị số kết quả; filter đã chọn thành chip có thể bỏ.
- Sort: nổi bật, mới nhất, giá tăng, giá giảm.
- Trở lại PLP giữ filter, sort và vị trí scroll.

### Product detail

- Gallery không gây layout shift; thumbnail có alt rõ.
- Color swatch có tên text, không truyền đạt chỉ bằng màu.
- Size selector hiển thị trạng thái còn/hết; size guide là dialog truy cập được.
- Mobile có sticky add-to-cart sau khi khối mua hàng đi khỏi viewport.

### Cart và checkout

- Cart drawer không thay thế trang cart hoàn chỉnh.
- Checkout một cột trên mobile; desktop có form trái, order summary sticky phải.
- Lỗi đặt sát trường, giữ dữ liệu hợp lệ, focus vào lỗi đầu tiên khi submit.

### Đăng ký và đăng nhập

- Form đăng ký gồm email, mật khẩu, xác nhận mật khẩu và đồng ý điều khoản; họ tên/điện thoại bổ sung sau để giảm ma sát.
- Có trạng thái “kiểm tra email để xác minh”, gửi lại email có cooldown và luồng quên mật khẩu.
- Dùng cùng một trang `/login` cho customer/admin. Không tạo cổng admin bí mật hoặc mật khẩu admin riêng.

### Admin

- Dùng cùng token màu, typography, radius và motion của storefront; khác ở mật độ dữ liệu và bố cục dashboard.
- Desktop: sidebar thu gọn, top bar, breadcrumb, global search và quick action; mobile: sidebar thành drawer.
- Mọi bảng có search, filter, sort, pagination, empty/loading/error, chọn hàng và bulk action có xác nhận.
- Giá/tồn kho sửa nhanh phải validate inline, báo unsaved state và tránh ghi đè thay đổi đồng thời.
- Form chiết khấu có date-time picker, múi giờ, preview trạng thái và phạm vi áp dụng.
- Thao tác hủy đơn, refund, xóa/unpublish sản phẩm, khóa thành viên dùng confirm dialog mô tả hậu quả.
- Dashboard admin cũng hỗ trợ sáng/tối và nút toàn màn hình.

## Trạng thái bắt buộc

Loading skeleton, empty, no-results, offline, permission denied, validation error, server error, out-of-stock và success. Không dùng spinner toàn trang nếu có thể render skeleton.

## Accessibility

- Có skip link, landmark, heading đúng thứ tự và focus visible.
- Contrast text thường ≥ 4.5:1; text lớn ≥ 3:1.
- Dialog trap focus và trả focus về trigger khi đóng.
- Tôn trọng `prefers-reduced-motion` và theme hệ thống.
- Alt mô tả sản phẩm/góc chụp; ảnh trang trí dùng alt rỗng.
