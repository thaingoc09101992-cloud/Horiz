# Đặc tả Dashboard bán hàng và tồn kho

## 1. Mục tiêu vận hành

Dashboard giúp admin trả lời nhanh:

1. Doanh thu và đơn hàng đang tăng hay giảm so với kỳ trước?
2. Sản phẩm nào tạo doanh thu chính?
3. SKU nào hết hàng, sắp hết hoặc tồn quá lâu?
4. Có vấn đề nào cần xử lý ngay hôm nay?

Dashboard ưu tiên hành động vận hành, không thay thế báo cáo kế toán.

## 2. Bộ lọc chung

- Khoảng thời gian: hôm nay, 7 ngày, 30 ngày, tháng này, khoảng tùy chọn.
- Mặc định: 30 ngày gần nhất; timezone `Asia/Ho_Chi_Minh`.
- Category, collection và product; mở rộng channel/location khi có dữ liệu.
- So sánh kỳ trước có cùng số ngày và nằm ngay trước kỳ được chọn.
- Filter được giữ trong URL để reload/chia sẻ nội bộ; không chứa dữ liệu nhạy cảm.

## 3. KPI cấp cao

| KPI | Công thức | Quy tắc |
|---|---|---|
| Doanh thu thuần | Tổng `grand_total` đơn paid − refund đã hoàn tất | Loại đơn test/cancelled; timezone theo `paid_at` |
| Đơn đã thanh toán | Số order duy nhất có payment paid | Không đếm callback/webhook trùng |
| Giá trị đơn trung bình | Doanh thu thuần / đơn đã thanh toán | Hiển thị `—` nếu mẫu số bằng 0 |
| Sản phẩm đã bán | Tổng quantity của order items thuộc đơn paid | Điều chỉnh phần đã refund nếu nghiệp vụ hỗ trợ item refund |
| Tỷ lệ hoàn/hủy | Đơn refunded/cancelled / tổng đơn hợp lệ | Tách refund và cancel trong drill-down |

Ba KPI chính là doanh thu thuần, đơn đã thanh toán và giá trị đơn trung bình. Các KPI còn lại dùng để chẩn đoán, không làm dày khu vực đầu trang.

## 4. KPI tồn kho

| KPI | Công thức | Hành động |
|---|---|---|
| SKU hết hàng | `available = 0` và variant active | Lọc danh sách để nhập/ẩn SKU |
| SKU sắp hết | `available <= reorder_level` và `available > 0` | Tạo điều chỉnh/kế hoạch nhập |
| Hàng đang reserve | Tổng `reserved` | Kiểm tra reservation quá hạn |
| Giá trị tồn | Tổng `on_hand × unit_cost` | Nếu thiếu cost, không hiển thị hoặc ghi rõ proxy |
| Hàng tồn chậm | Active SKU còn hàng nhưng không bán trong N ngày | N mặc định 60, cho cấu hình |
| Sell-through | Units sold / (opening stock + units received) | Theo kỳ và SKU/category |

Không dùng giá bán thay giá vốn mà vẫn gọi là “giá trị tồn kho”. Nếu chưa thu thập `unit_cost`, dashboard hiển thị số lượng tồn và đánh dấu KPI giá trị là chưa khả dụng.

## 5. Bố cục dashboard

### Hàng 1 — tổng quan

- 3 KPI bán hàng chính, mỗi thẻ có giá trị, phần trăm so kỳ trước, sparkline và tooltip.
- 3 thẻ cảnh báo tồn kho: hết hàng, sắp hết, reserve quá hạn.

### Hàng 2 — xu hướng

- Biểu đồ kết hợp doanh thu dạng line/area và số đơn dạng bar theo ngày.
- Toggle theo ngày/tuần/tháng tùy độ dài khoảng chọn.
- Hover hiển thị giá trị chính xác; không dùng hai trục nếu dễ gây hiểu sai, có thể tách hai biểu đồ đồng bộ.

### Hàng 3 — chẩn đoán bán hàng

- Cơ cấu trạng thái đơn: pending payment, paid, processing, shipped, delivered, cancelled/refunded.
- Top 10 sản phẩm theo doanh thu thuần, kèm units và tồn khả dụng.
- Promotion performance khi có promotion: doanh thu, đơn và discount đã cấp.

### Hàng 4 — sức khỏe tồn kho

- Tồn khả dụng theo category.
- Danh sách SKU cần chú ý: SKU, sản phẩm, available, reorder level, bán 30 ngày, số ngày không bán, đề xuất hành động.
- Biểu đồ biến động nhập/xuất/điều chỉnh theo thời gian.

### Hàng 5 — hàng đợi hành động

- Đơn chờ xử lý quá SLA.
- Payment/webhook lỗi.
- Reservation hết hạn chưa release.
- SKU bán nhanh nhưng dưới reorder level.
- Mỗi dòng dẫn thẳng đến màn hình xử lý tương ứng.

## 6. Freshness và nguồn dữ liệu

- Đơn hàng/doanh thu: gần thời gian thực sau webhook; hiển thị `last updated`.
- Tồn kho: đọc nguồn operational hiện tại; movement/snapshot phục vụ xu hướng.
- KPI theo kỳ có thể dùng query trực tiếp ở quy mô nhỏ. Chỉ tạo materialized/aggregate table sau khi đo thấy query không đạt ngân sách hiệu năng.
- Mọi aggregate job phải idempotent, có khả năng rebuild từ source tables.

## 7. Trạng thái dữ liệu và UX

- Loading dùng skeleton giữ đúng kích thước layout.
- Không có dữ liệu hiển thị empty state; dữ liệu chưa tải/lỗi không được hiển thị `0`.
- Metric thiếu `unit_cost` hiển thị “Chưa có dữ liệu giá vốn” kèm link tới hướng dẫn bổ sung.
- Tooltip giải thích công thức, trạng thái được bao gồm/loại trừ và thời điểm cập nhật.
- Light/dark, responsive và full screen; biểu đồ không phụ thuộc màu duy nhất và có bảng dữ liệu thay thế.

## 8. Guardrails và kiểm thử

- Loại đơn test, payment thất bại, order cancelled và webhook trùng theo quy tắc thống nhất.
- Refund ảnh hưởng doanh thu đúng ngày refund hoặc ngày sale theo chế độ báo cáo đã chọn; mặc định dùng ngày refund và ghi rõ.
- Kiểm thử ranh giới ngày/tháng theo Asia/Ho_Chi_Minh.
- Đối soát KPI với danh sách đơn/SKU chi tiết trên cùng filter.
- Customer/staff không đủ quyền không truy cập được endpoint/dashboard data.
- Mục tiêu tải: nội dung khung ≤ 1 giây; KPI chính ≤ 2 giây ở dữ liệu mục tiêu; phần nặng tải tiếp theo.

## 9. Chưa đặt target kinh doanh

Chưa đặt mục tiêu doanh thu, AOV, tỷ lệ hoàn hoặc mức tồn tối ưu vì chưa có dữ liệu lịch sử và kế hoạch kinh doanh. Sau 4–8 tuần dữ liệu ổn định, dùng baseline thực tế để đặt target và ngưỡng cảnh báo.

