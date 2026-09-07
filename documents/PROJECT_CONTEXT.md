# Bối cảnh dự án HORIZ

## 1. Tầm nhìn

HORIZ là cửa hàng trực tuyến ưu tiên trải nghiệm tối giản, giàu hình ảnh, dễ chọn biến thể và mua nhanh. Dự án tham khảo kiến trúc thông tin và hành trình mua hàng của các storefront thương mại điện tử hiện đại, nhưng tạo bản sắc riêng thay vì trở thành bản sao trực quan.

## 2. Hiện trạng workspace

Workspace đã có nền ứng dụng Phase 1 tại `apps/storefront`; catalogue/commerce vẫn chưa được triển khai. Tài sản nguồn hiện có:

| Tài sản | Số lượng/ghi chú |
|---|---:|
| Ảnh sản phẩm và homepage | 1.263 JPG, 327,47 MB |
| Thư mục sản phẩm duy nhất | 291 |
| Ảnh homepage | 25 |
| Manifest | file CSV manifest ảnh nguồn trong `Source/` (ngoài Git), 1.263 dòng |
| Logo HORIZ | 2 PNG ở thư mục gốc |

Phân bổ ảnh: Women 590, Men 487, Unisex 156, Homepage 25, Toddler 5.

Phân bổ catalogue:

| Nhóm | Sản phẩm | Ảnh |
|---|---:|---:|
| Women / Shoes | 118 | 568 |
| Men / Shoes | 96 | 463 |
| Unisex / Socks | 56 | 125 |
| Men / Apparel | 6 | 24 |
| Unisex / Apparel | 6 | 16 |
| Women / Apparel | 4 | 17 |
| Unisex / Shoes | 3 | 15 |
| Women / Underwear | 1 | 5 |
| Toddler / Shoes | 1 | 5 |

## 3. Giả định làm việc

- Thị trường đầu tiên: Việt Nam; ngôn ngữ mặc định tiếng Việt; tiền tệ VND.
- Catalogue ban đầu được sinh từ manifest nhưng cần làm sạch tên, gom màu/biến thể và bổ sung mô tả.
- Guest checkout được ưu tiên; khách có thể tạo tài khoản sau khi mua.
- Quản trị viên quản lý catalogue, tồn kho và trạng thái đơn hàng.
- HORIZ chịu trách nhiệm xác minh quyền sử dụng thương mại toàn bộ hình ảnh và nội dung.

## 4. Quyết định còn mở

- Cổng thanh toán: Stripe, PayOS, VNPay, MoMo hoặc COD.
- Đơn vị vận chuyển và cách tính phí.
- Chính sách đổi trả, miễn phí vận chuyển, thuế và hóa đơn.
- Nguồn ảnh thương mại cuối cùng.
- Có bán tồn kho thật ngay ở MVP hay chỉ dựng storefront demo.

## 5. Tiêu chí thành công

- Người dùng tìm được sản phẩm phù hợp trong tối đa 3 lần tương tác chính.
- Luồng từ trang sản phẩm đến hoàn tất đặt hàng rõ ràng trên mobile.
- Không bán vượt tồn; webhook thanh toán có tính idempotent.
- LCP mục tiêu ≤ 2,5 giây ở p75, CLS ≤ 0,1, INP ≤ 200 ms.
- WCAG 2.2 AA cho các luồng chính.
