# Phân tích tham chiếu Allbirds

> Khảo sát website công khai ngày 24/08/2026. Giao diện và chương trình bán hàng có thể thay đổi theo thời điểm.

## 1. Cấu trúc trải nghiệm đáng học

### Header và điều hướng

- Điều hướng ưu tiên Men/Women, New Arrivals, Bestsellers, Shoes, Apparel & Accessories.
- Mega menu nhóm theo giới tính, loại sản phẩm và bộ sưu tập nổi bật.
- Search, tài khoản và giỏ hàng luôn dễ tiếp cận.
- Cart drawer phản hồi tức thì sau khi thêm hàng và hiển thị ngưỡng miễn phí vận chuyển.

### Trang chủ

Nhịp nội dung hiện tại: announcement/collection mới → hero có 2 CTA Men/Women → New Arrivals → khối Men/Women → Best Sellers dạng carousel → campaign theo mùa → brand benefits/material story → newsletter → footer.

Homepage HORIZ prototype bám theo thứ tự trên và dùng typography sans đậm cho nội dung bán hàng; font display gần Perpetua Titling MT chỉ dành cho wordmark để tránh cảm giác editorial lệch khỏi tham chiếu.

### Danh mục

- Banner ngắn, grid sản phẩm lớn, nhiều khoảng trắng.
- Filter/sort là công cụ chính; mobile dùng drawer.
- Card nhấn mạnh ảnh, tên, màu và giá; badge NEW/SALE dùng có tiết chế.

### Chi tiết sản phẩm

- Gallery chiếm phần lớn màn hình; khối mua hàng sticky ở desktop.
- Thứ tự quyết định: tên/giá → màu → size → CTA → lợi ích/giao nhận → mô tả/chất liệu/chăm sóc.
- Cross-sell xuất hiện sau thông tin cốt lõi, không cản CTA.

### Nội dung thương hiệu

Allbirds lặp lại ba trụ cột: thoải mái cả ngày, dùng hằng ngày và vật liệu có nguồn gốc tự nhiên. HORIZ nên học cách lặp thông điệp nhất quán nhưng phải viết value proposition riêng.

## 2. Áp dụng cho HORIZ

| Tham chiếu | HORIZ áp dụng | HORIZ tạo khác biệt |
|---|---|---|
| Editorial hero | Hero toàn chiều rộng, CTA đôi | Copy, ảnh và art direction riêng |
| Mega menu | Men/Women/Unisex/Kids | Thêm “Theo nhu cầu” và tìm nhanh |
| Product carousel | New/Best Seller | Cho phép kéo và keyboard navigation |
| Sticky buy box | Giữ trên desktop | Hiển thị tồn kho và giao dự kiến rõ hơn |
| Cart drawer | Thêm hàng không rời trang | Tóm tắt ưu đãi minh bạch, không dark pattern |
| Sustainability story | Khối vật liệu | Chỉ nêu claim có bằng chứng |

## 3. Không sao chép

- Không dùng logo, wordmark, tên bộ sưu tập, slogan hoặc đoạn copy Allbirds.
- Không sao chép pixel-perfect, mã HTML/CSS/JS hoặc toàn bộ hệ màu/type.
- Không công bố ảnh trong folder hiện tại khi chưa có giấy phép.
- “Giống 90%” được hiểu là tương đương về loại trang, flow, độ hoàn thiện và mật độ nội dung; không phải giống 90% nhận diện.

## 4. Nguồn tham khảo

- [Allbirds homepage](https://www.allbirds.com/)
- [Allbirds — How We Operate](https://www.allbirds.com/pages/how-we-operate)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
