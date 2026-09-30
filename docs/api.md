# GymFlow REST API v1

Base path: `/api/v1`. Tất cả endpoint trừ `/health` và `/auth/login` cần `Authorization: Bearer <token>`.

## Authentication

| Method | Endpoint | Mô tả | Quyền |
| --- | --- | --- | --- |
| POST | `/auth/login` | Đăng nhập nhận JWT | Public |
| GET | `/auth/me` | User hiện tại | Auth |
| POST | `/auth/logout` | Kết thúc phiên phía client | Auth |

## Dashboard

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/dashboard/summary` | KPI, revenueByMonth, membershipBreakdown |
| GET | `/dashboard/revenue` | Chuỗi doanh thu theo tháng |
| GET | `/dashboard/activity` | Hoạt động check-in gần đây |

## Resources

- `members`: `GET/POST /members`, `GET/PATCH/DELETE /members/:id`.
- `plans`: `GET/POST /plans`, `GET/PATCH/DELETE /plans/:id`.
- `memberships`: `GET/POST /memberships`, `PATCH /memberships/:id`.
- `trainers`: `GET/POST /trainers`, `GET/PATCH/DELETE /trainers/:id`.
- `schedules`: `GET/POST /schedules`, `GET/PATCH/DELETE /schedules/:id`; POST/PATCH validate time window, trainer ownership and overlap.
- `checkins`: `GET/POST /checkins`, `GET /checkins/:id`, `PATCH /checkins/:id/checkout`, `GET /checkins/summary`; check-in requires active member + active membership + date in range.
- `payments`: `GET/POST /payments`, `GET/PATCH /payments/:id`; `membershipId` must exist and belong to the selected member.
- `users`: `GET/POST /users`, `GET/PATCH/DELETE /users/:id` (Admin only).
- `audit-logs`: `GET /audit-logs` cho Admin.

## Query parameters

Resource list hỗ trợ `page`, `limit`, `search`, `status`. Ví dụ: `/members?page=1&limit=10&search=Huy&status=active`.

## Status codes

| Code | Ý nghĩa |
| --- | --- |
| 200 | Đọc/cập nhật thành công |
| 201 | Tạo resource thành công |
| 204 | Xóa thành công, không có body |
| 400 | Query/body/ID không hợp lệ |
| 401 | Thiếu hoặc sai JWT |
| 403 | Có JWT nhưng thiếu role |
| 404 | Không tìm thấy resource |
| 409 | Xung đột nghiệp vụ |
| 500 | Lỗi không dự kiến |

## Ví dụ error contract

```json
{
  "success": false,
  "error": {
    "code": "MEMBERSHIP_REQUIRED",
    "message": "Hội viên chưa có gói tập còn hiệu lực"
  }
}
```

## Ví dụ tạo check-in

```bash
curl -X POST http://localhost:3000/api/v1/checkins \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer <token>' \\
  -d '{"memberId":1}'
```

API kiểm tra member active, membership còn hạn và check-in đang mở trước khi tạo record.

## Phân quyền

- Admin: dashboard và toàn bộ thao tác quản trị.
- Trainer: chỉ xem/cập nhật lịch của mình; chỉ xem tên, mã và thông tin liên hệ cần thiết của hội viên có lịch được phân công. Không có quyền xem dashboard doanh thu, check-in tổng hợp hoặc thanh toán.
- Member: chỉ xem hồ sơ, membership, lịch, check-in và thanh toán gắn với tài khoản của mình; không có quyền ghi dữ liệu.

Các giới hạn này được kiểm tra tại API, không chỉ dựa vào menu frontend.
