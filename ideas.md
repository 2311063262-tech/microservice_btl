# Design brief — GymFlow

## Hướng đã chọn: Midnight Performance

GymFlow là bảng điều khiển vận hành cho một phòng gym hiện đại: chắc chắn, nhanh, rõ ràng và có năng lượng tích cực. Thiết kế ưu tiên khả năng đọc dữ liệu và trình diễn nghiệp vụ hơn là trang trí.

- **Design movement:** editorial dashboard / performance operations.
- **Core principles:** data-first, strong hierarchy, calm surfaces, purposeful accent, fast feedback.
- **Color philosophy:** nền ink/navy sâu; surface slate xanh than; chữ trắng ngà; lime/electric green biểu thị active, tăng trưởng và CTA; amber cho cảnh báo; rose cho lỗi.
- **Layout paradigm:** sidebar điều hướng cố định trên desktop, header compact, nội dung theo grid; card số liệu nhỏ gọn, biểu đồ và bảng có nhịp đều.
- **Signature elements:** logo đường chạy + nhịp tim bằng hai hình khối; đường accent lime mảnh; badge trạng thái dạng pill; bảng có zebra nhẹ.
- **Interaction philosophy:** mọi thao tác có phản hồi bằng toast; form ngắn, rõ; filter/search cập nhật nhanh; trạng thái loading, empty, error luôn được thiết kế.
- **Animation:** chỉ dùng fade/slide nhẹ 150–220ms, hover nâng card 1–2px; không dùng animation gây mất tập trung.
- **Typography system:** Inter/system sans cho UI; số liệu dùng font-weight 700/800; tiêu đề ngắn, body 14–16px.
- **Brand essence:** “Vận hành khỏe hơn, mỗi ngày.”
- **Brand voice:** tự tin, hỗ trợ, trực tiếp, chuyên nghiệp nhưng không khô cứng.
- **Wordmark/logo:** GymFlow viết hoa chữ G/F; logo mark là đường chuyển động kết hợp nhịp tim, hình khối phẳng, ít chi tiết.
- **Signature brand color:** #B7F34A (GymFlow Lime).

## Branding delivery

- `client/public/logo-mark.svg`: biểu tượng full-bleed dùng làm favicon/brand mark.
- Header dùng mark + wordmark GymFlow.
- Không dùng ảnh stock; đây là dashboard nghiệp vụ nên hình ảnh phụ không cần thiết.
