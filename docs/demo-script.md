# Kịch bản demo trước lớp

## Mở đầu — 30 giây

“GymFlow là hệ thống quản lý phòng gym theo hướng service-oriented. Frontend chỉ là một consumer; các nghiệp vụ được expose qua RESTful API `/api/v1`, có JWT, role authorization, validation và response contract.”

## Demo luồng chính — 4 phút

1. **Dashboard:** chỉ vào KPI và nói dữ liệu lấy từ `GET /dashboard/summary`, không hard-code ở UI.
2. **Hội viên:** mở `/members`, search theo tên và lọc active; giải thích `page`, `limit`, `search`, `status`.
3. **API docs:** mở `/api-docs`, chỉ ra method, base path, Bearer token và status code.
4. **Check-in:** gọi `POST /checkins` cho member có membership; gọi lại lần hai để cho thấy `409 ALREADY_CHECKED_IN`.
5. **Check-out:** gọi `PATCH /checkins/:id/checkout`; server tự tính số phút.
6. **Thanh toán:** tạo payment; mở Dashboard giải thích doanh thu/hoạt động.
7. **Phân quyền:** đăng nhập Trainer để xác nhận chỉ xem được lịch của mình, thông tin tối thiểu của hội viên được phân công và nhận `403 FORBIDDEN` với dashboard/thanh toán. Đăng nhập Member để xác nhận chỉ xem được dữ liệu cá nhân.

## Câu hỏi có thể bị hỏi

**Tại sao dùng RESTful API?** Vì resource có URI ổn định, HTTP method thể hiện hành động, stateless Bearer token và client có thể thay bằng mobile/app khác.

**API xử lý lỗi thế nào?** Có error middleware và format `{ success: false, error: { code, message, details } }`; status code khác nhau giúp consumer xử lý đúng.

**Phân quyền nằm ở đâu?** JWT xác thực danh tính; middleware `allow(...)` kiểm tra role trước controller.

**Dữ liệu có còn sau khi restart không?** Có. Khi `DATABASE_URL` được cấu hình, REST API đọc/ghi MariaDB; nếu database trống, `pnpm seed` nhập dữ liệu từ JSON. MariaDB là nguồn chính, JSON là bản sao local.

**Check-in trùng được chặn thế nào?** Server tìm record cùng member chưa có `checkOutAt`; nếu tồn tại trả `409`, không dựa vào UI.

**Có thể mở rộng thành microservices không?** Có thể tách member, billing, attendance thành service riêng vì mỗi domain đã có resource/API boundary; cần thêm service discovery, message broker, observability và distributed transaction nếu triển khai thật.
