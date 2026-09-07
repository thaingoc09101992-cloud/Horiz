# Quy ước làm việc cho AI/cộng tác viên

## Bắt buộc đọc trước khi sửa

`README.md` → `PROJECT_CONTEXT.md` → `PRD.md` → tài liệu chuyên môn liên quan. Nếu yêu cầu xung đột, ưu tiên yêu cầu người dùng mới nhất rồi cập nhật tài liệu quyết định.

## Nguyên tắc thực thi

- Không tự mở rộng phạm vi ngoài PRD hoặc tự chọn payment/shipping khi chưa chốt.
- Không sao chép code, câu chữ hay nhận diện của bất kỳ thương hiệu nào khác; chỉ tham khảo pattern UX phổ biến.
- Không publish asset có quyền sử dụng chưa được xác minh.
- Bảo toàn thay đổi của người khác; kiểm tra diff trước/sau khi sửa.
- Thay đổi schema phải có migration, generated types và test RLS.
- Không đưa secret/service role key vào client, source hoặc log.
- Không tin price, inventory, role hay order status từ client.
- Không coi việc ẩn link `Administrator` là authorization; mọi admin mutation phải được kiểm tra server/RLS.
- Repository có thể được sửa bằng Codex và Claude. Sau thay đổi database, business rule, kiến trúc, API contract hoặc quyền truy cập, bắt buộc cập nhật tài liệu liên quan trong cùng thay đổi.
- Thay đổi kiến trúc/business rule lớn phải có ADR trong `documents/decisions/` và đồng thời cập nhật tài liệu chuẩn; ADR không thay thế tài liệu chuẩn.

## Chuẩn code dự kiến

- TypeScript strict; tránh `any`; validate dữ liệu runtime ở boundary.
- Component nhỏ theo feature; shared UI chỉ chứa primitive tái sử dụng thật sự.
- Semantic HTML, keyboard support, visible focus và reduced motion.
- Mọi giao diện có light/dark; header/utilities có full screen.
- Tối ưu ảnh theo `IMAGE_ASSETS.md`; không import ảnh 327 MB vào bundle.

## Kiểm tra trước bàn giao

- Chạy lint, typecheck, unit tests, build và E2E phù hợp phạm vi.
- Nêu rõ file đổi, kiểm tra đã chạy và rủi ro/việc còn lại.
- Với thay đổi commerce: test giá server-side, oversell, idempotency và webhook replay.
- Với Supabase: kiểm tra grants, RLS theo nhiều user và không dùng metadata người dùng để phân quyền.
