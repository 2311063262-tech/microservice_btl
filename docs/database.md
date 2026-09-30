# Mô hình dữ liệu GymFlow

## Các bảng chính

| Bảng | Vai trò | Quan hệ chính |
| --- | --- | --- |
| `users` | Tài khoản và vai trò | `createdBy`, `recordedBy`, `actorId` |
| `members` | Hồ sơ hội viên | 1-n với memberships, checkins, payments, schedules |
| `plans` | Sản phẩm gói tập | 1-n với memberships |
| `memberships` | Quyền truy cập theo thời hạn | n-1 members, n-1 plans |
| `trainers` | Hồ sơ PT | 1-n với schedules |
| `schedules` | Lịch PT/lớp nhóm | n-1 members, n-1 trainers |
| `checkins` | Ra/vào phòng tập | n-1 members, n-1 users |
| `payments` | Giao dịch | n-1 members, optional n-1 memberships |
| `auditLogs` | Dấu vết thao tác | n-1 users |

## Invariants nghiệp vụ

- `members.code` và `payments.reference` là duy nhất.
- `plans.price`, `payments.amount`, `memberships.amount` phải lớn hơn 0.
- Chỉ plan `active` mới được tạo membership.
- Membership có `startDate`, `endDate`, status `active/expired/cancelled`.
- Check-in chỉ hợp lệ khi member active và có membership còn hạn.
- Một member không được có hai check-in chưa checkout cùng lúc.
- Một trainer không có hai schedule `scheduled` bị overlap.
- Không xóa user Admin mặc định.
- Audit log ghi actor, action, resource, resource id và timestamp.

## Persistence boundary

Khi `DATABASE_URL` được cấu hình, REST API nạp các bảng MariaDB khi khởi động và ghi snapshot trong transaction sau mỗi thao tác POST/PATCH/DELETE thành công. `.gymflow-data/gymflow.json` được giữ làm bản sao local.

`pnpm seed` chỉ nhập snapshot local khi database chưa có bản ghi; không xóa dữ liệu SQL hiện có. XAMPP local dùng `127.0.0.1:3306` và database riêng `gymflow_rest`. Để nhiều máy dùng chung, các client truy cập cùng API server; không mở cổng SQL trực tiếp ra Internet. Mật khẩu demo đang lưu dạng rõ và cần được hash trước khi triển khai thật.
