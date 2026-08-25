# Tài sản hình ảnh và quy trình nhập catalogue

## 1. Nguồn hiện có

- Root ảnh: `Source/Hinh anh/Allbirds_Images`.
- Manifest: `Source/Allbirds_Images_Manifest.csv`.
- 1.263 JPG; 291 thư mục sản phẩm; giá nguồn khoảng 4–160 USD và 105.000–4.210.000 VND.
- Mỗi dòng manifest có: `Danh_muc_chinh`, `Danh_muc_phu`, `San_pham`, `Ten_file`, `Duong_dan_tuong_doi`, `Kich_thuoc_byte`, `Gia_USD`, `Gia_VND`.

## 2. Vấn đề dữ liệu cần xử lý

- `San_pham` đang trộn model và màu trong cùng slug; cần tách product, color variant và asset.
- Nhiều sản phẩm có 1–5 ảnh; không được giả định luôn có 5.
- Tên marketing, mô tả, chất liệu, size, tồn kho, alt text và thứ tự ảnh chưa có.
- Giá lặp theo từng ảnh; import phải gom theo product/variant.
- Có nguy cơ bản quyền vì thư mục và tên ảnh đến từ Allbirds.

## 3. Mapping nhập dữ liệu

| CSV | Đích | Xử lý |
|---|---|---|
| `Danh_muc_chinh` | audience/category | map Men/Women/Unisex/Toddler |
| `Danh_muc_phu` | category | Shoes/Apparel/Socks/Underwear |
| `San_pham` | source_slug | giữ nguyên để truy vết |
| `Gia_VND` | price_amount | bỏ dấu/chữ, parse bigint |
| `Ten_file` | original_filename | giữ làm metadata |
| `Duong_dan_tuong_doi` | source_path | chuẩn hóa `/` |

## 4. Pipeline đề xuất

1. Validate header, encoding, đường dẫn, file tồn tại và checksum.
2. Tạo report lỗi/cảnh báo; hỗ trợ dry-run, không ghi DB ngay.
3. Gom folder thành source product; quy tắc tách màu chỉ là gợi ý, bắt buộc review thủ công.
4. Chuyển ảnh sang WebP/AVIF, loại EXIF, tạo width 480/768/1200/1800.
5. Upload bằng API Storage, không chỉnh trực tiếp bảng `storage`.
6. Ghi asset metadata, alt text, width/height, blur placeholder, sort order.
7. Chỉ publish sau checklist nội dung và quyền sử dụng.

## 5. Cấu trúc object key

```text
products/{product_id}/{variant_id}/{asset_id}-{width}.webp
products/{product_id}/{variant_id}/{asset_id}-{width}.avif
content/home/{section_id}/{asset_id}-{width}.webp
```

Không dùng tên file làm ID. Tên file có thể đổi; ID/checksum phải ổn định.

## 6. Lưu trữ

- MVP đơn giản: Supabase Storage cho product images và RLS/admin upload.
- Public delivery có thể qua CDN; cache filename immutable.
- Nếu chuyển ảnh sang Cloudflare Images/R2 sau này, giữ bảng `media_assets` độc lập để không khóa kiến trúc vào một provider.

## 7. Checklist quyền sử dụng

- Xác nhận chủ sở hữu và giấy phép từng nhóm asset.
- Lưu `rights_status`, `rights_owner`, `license_reference`, `expires_at`.
- Asset `unknown/restricted` không được publish production.
- Thay toàn bộ copy/slogan và metadata nhắc Allbirds bằng nội dung HORIZ.

## 8. Asset dùng trong prototype cục bộ

- Homepage development hiện dùng bản sao chọn lọc trong `apps/storefront/public/prototype` để kiểm tra bố cục và responsive.
- Các file này có nguồn từ `Source/Hinh anh/Allbirds_Images/Homepage`; trạng thái quyền sử dụng vẫn là `unknown/restricted`.
- Không deploy nhóm asset prototype lên staging/production. Trước khi phát hành phải thay bằng ảnh HORIZ đã được xác nhận quyền sử dụng và cập nhật alt text tương ứng.

## 9. Catalogue được tuyển chọn từ manifest

- Script nguồn: `scripts/build-catalogue.mjs`.
- Quy tắc: loại `Homepage`; chọn tối đa 12 sản phẩm cho từng cặp `Danh_muc_chinh / Danh_muc_phu`; nhóm dưới 12 lấy toàn bộ.
- Dữ liệu web sinh ra tại `apps/storefront/src/data/catalogue.generated.json`; ảnh đại diện tại `apps/storefront/public/catalogue`.
- File đối soát nằm cạnh manifest gốc: `Source/Danh_muc_san_pham_dung_web.csv`. File giữ toàn bộ trường nguồn và thêm mã web, tên hiển thị, thứ tự, cờ ảnh đại diện, số ảnh và trạng thái bản quyền.
- Chạy lại `node scripts/build-catalogue.mjs` sau mỗi lần thay manifest hoặc thay quy tắc chọn.
