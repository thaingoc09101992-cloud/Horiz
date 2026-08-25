# Hướng dẫn font HORIZ

## 1. Font logo hiện tại

`Perpetua Titling MT` là display/titling typeface của Monotype, được Microsoft phân phối trong một số sản phẩm. Microsoft ghi rõ font phù hợp kích thước lớn và nên tăng khoảng cách chữ; quyền có font trên máy/Office không mặc nhiên là quyền nhúng file `.ttf` lên website.

Quyết định:

- Giữ logo hiện có dưới dạng SVG/PNG đã outline/raster hóa nếu quyền tạo logo hợp lệ.
- Không copy `Pertili.ttf` hoặc `Pertibd.ttf` vào repository/public khi chưa có webfont license.
- Nếu mua quyền webfont chính thức, dùng WOFF2 self-host, subset ký tự cần thiết và lưu bằng chứng license.

Nguồn: [Microsoft Typography — Perpetua Titling MT](https://learn.microsoft.com/en-us/typography/font-list/perpetua-titling-mt).

## 2. Font web đề xuất

| Font | Vai trò | Mức phù hợp | Ghi chú |
|---|---|---|---|
| Manrope | Heading, body, UI và admin | Đang dùng | Hình dáng mềm, hiện đại, hỗ trợ tiếng Việt tốt |
| Cormorant SC | Không dùng trong UI hiện tại | Dự phòng | Small caps gây lỗi hình thái và dấu ở nhiều chuỗi tiếng Việt |
| Cinzel | Heading thay thế | Mạnh/mang tính monument | Nét khắc La Mã rõ, hợp headline ngắn |
| Marcellus SC | Heading thay thế | Tiết chế | Dễ đọc hơn khi kích thước vừa |
| Cormorant Garamond | Quote/long editorial | Mềm hơn | Không dùng cho bảng/admin |
| Inter | Body, UI, admin | Khuyến nghị | Rõ ở cỡ nhỏ, nhiều weight, hợp dữ liệu |

`Cormorant SC` trong Google Fonts được phát hành theo SIL Open Font License: [metadata chính thức](https://github.com/google/fonts/blob/main/ofl/cormorantsc/METADATA.pb).

## 3. Cặp font được chốt

- Logo: asset `elegant_horïz_serif_wordmark.png`, được phục vụ bằng tên web an toàn `horiz-wordmark.png`.
- Heading/Body/UI/Admin: Manrope 400/500/600/700 để tạo cảm giác hiện đại, mềm và đảm bảo dấu tiếng Việt đồng nhất.
- Fallback: `Georgia, 'Times New Roman', serif` và `system-ui, sans-serif`.

```css
:root {
  --font-display: Manrope, ui-sans-serif, system-ui, sans-serif;
  --font-ui: Manrope, ui-sans-serif, system-ui, sans-serif;
}
```

`--font-logo` chỉ là fallback khi hiển thị text thử nghiệm; logo production nên dùng asset, không phụ thuộc máy người xem có Perpetua.

## 4. Cách dùng

- Logo/wordmark: giữ nguyên artwork, không letter-spacing bằng CSS lên ảnh.
- H1 hero: Manrope 48–72 px desktop, 36–48 px mobile, weight 700.
- H2 editorial: Manrope 32–48 px, weight 600–700.
- Heading admin: Manrope 24–32 px.
- Body: Manrope 16 px/1.5; label/table 13–14 px/1.4, weight 500.
- Không viết đoạn dài bằng small caps; không dùng quá hai family trên một màn hình.

## 5. Hiệu năng và tiếng Việt

- Self-host WOFF2 đã subset `latin` và `vietnamese`; preload tối đa font display chính và UI regular quan trọng.
- Dùng `font-display: swap`; khai báo size-adjust/fallback nếu cần giảm layout shift.
- Kiểm tra đầy đủ dấu tiếng Việt trong tên sản phẩm, checkout và admin trước khi chốt. Nếu một display font thiếu glyph hoặc dấu xấu, fallback Cormorant Garamond/Georgia cho chuỗi đó.
- Không tải toàn bộ weight; MVP chỉ cần Cormorant SC 500/600 và Inter 400/500/600/700.

### Trạng thái Phase 1

Manrope được self-host qua package `@fontsource/manrope`. Ứng dụng chỉ import subset Vietnamese và các weight đã chốt; không gọi Google Fonts và không nhúng file Perpetua Titling MT. Logo dùng PNG trong `public`.
