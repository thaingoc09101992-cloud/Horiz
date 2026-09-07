# Design system HORIZ

## Định hướng

“Natural editorial minimalism”: tinh gọn, ấm, có chất liệu; xây dựng bảng màu và typography riêng của HORIZ.

## Design tokens đề xuất

```css
:root {
  --bg: #f7f5ef;
  --surface: #ffffff;
  --text: #18201b;
  --muted: #667068;
  --brand: #234b3b;
  --brand-contrast: #ffffff;
  --accent: #c96f45;
  --border: #d9ddd8;
  --danger: #b42318;
  --success: #207a4a;
  --radius-sm: 4px;
  --radius-md: 10px;
  --radius-lg: 18px;
  --shadow-card: 0 8px 28px rgb(24 32 27 / 0.08);
}

[data-theme="dark"] {
  --bg: #111613;
  --surface: #19201c;
  --text: #f2f5f2;
  --muted: #aeb8b0;
  --brand: #91c8a9;
  --brand-contrast: #102018;
  --accent: #e19a72;
  --border: #354039;
}
```

Token cuối phải được kiểm tra contrast trước khi khóa.

## Typography

- Logo artwork: giữ `Perpetua Titling MT` trong file logo hiện có; không nhúng file font lên web nếu chưa mua quyền webfont.
- Display đề xuất: `Cormorant SC` 500/600 cho heading thương hiệu; fallback `Georgia, serif`.
- UI/body và admin: `Inter` 400/500/600 hoặc system sans để đọc bảng/form tốt.
- Phương án thay thế display: `Cinzel` nếu muốn cứng và monumental hơn; `Marcellus SC` nếu muốn tiết chế hơn.
- Scale: 12, 14, 16, 18, 24, 32, 48, 64 px; body 16 px, line-height 1.5.
- Heading display dùng tracking `0.04em–0.10em`, ưu tiên chữ ngắn; không dùng small caps cho paragraph.
- Chi tiết lựa chọn, giấy phép và cách tải font nằm trong `FONT_GUIDE.md`.

## Khoảng cách và grid

- Base unit 4 px; spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Container gutter: 16 mobile, 24 tablet, 32 desktop.
- Không hard-code màu/khoảng cách ngoài token trừ layout đặc biệt có giải thích.

## Component inventory

- Primitives: Button, IconButton, Link, Input, Select, Checkbox, Radio, Badge, Price.
- Overlay: Dialog, Drawer, Popover, Toast.
- Commerce: ProductCard, ProductRail, ProductGallery, ColorSwatch, SizePicker, Quantity, CartLine, OrderSummary.
- Layout: AnnouncementBar, Header, MegaMenu, Footer, Section, Breadcrumb.
- Feedback: Skeleton, EmptyState, InlineError, ErrorBoundary.
- Admin: DataTable, StatCard, FilterBar, DateTimeRange, MoneyInput, StockAdjustment, StatusBadge, AuditTimeline.

## Quy tắc component

- Button variants: primary, secondary, ghost, destructive; size sm/md/lg.
- Không dùng màu làm tín hiệu duy nhất.
- Hover chỉ bổ sung; mọi thao tác vẫn rõ trên touch.
- Motion 120–240 ms; giảm hoặc tắt khi `prefers-reduced-motion`.
- Theme lưu localStorage, lần đầu theo hệ điều hành, không flash sai theme.

## Logo

Hai file logo gốc cần được kiểm tra trùng nội dung và xuất bản WebP/SVG phù hợp. Giữ clear space tối thiểu bằng chiều cao chữ H; không kéo méo, thêm shadow hoặc đổi màu tùy ý.
