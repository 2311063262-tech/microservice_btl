<<<<<<< HEAD

=======
# GymFlow — Hệ thống quản lý phòng gym dựa trên RESTful API

GymFlow là project mẫu hoàn chỉnh cho đề tài **Xây dựng hệ thống quản lý phòng gym dựa trên RESTful API**, phục vụ môn **Phát triển phần mềm hướng dịch vụ**. Ứng dụng gồm dashboard quản trị tiếng Việt, backend Express, REST API v1, JWT authentication, role-based authorization, validation bằng Zod, Drizzle schema cho MySQL-compatible database và dữ liệu demo.

## Điểm nổi bật

| Nhóm | Nội dung |
| --- | --- |
| Dashboard | KPI hội viên, doanh thu, check-in hôm nay, biểu đồ doanh thu và membership mix |
| Nghiệp vụ | Members, plans, memberships, check-in/out, trainers, schedules, payments, users |
| REST API | `/api/v1`, response/error shape thống nhất, pagination, search/filter, HTTP status codes |
| Bảo mật demo | JWT Bearer token, role Admin/Member/Trainer, password demo lưu dạng rõ trong database demo |
| Tài liệu | OpenAPI JSON, API guide, architecture, database model và demo script |
| Chạy local | Lưu dữ liệu CRUD trong MariaDB XAMPP; JSON local được giữ làm bản sao |

## Yêu cầu môi trường

- Node.js 22+
- pnpm 10.18+
- XAMPP MariaDB đang chạy tại `127.0.0.1:3306` (đã cấu hình trong `.env`)

> **Windows / IntelliJ:** project đã dùng `cross-env`, nên `pnpm dev` chạy trực tiếp trong PowerShell hoặc CMD, không cần tự đặt `NODE_ENV` bằng cú pháp Unix.

## Chạy với XAMPP MariaDB

```bash
pnpm install
pnpm db:migrate
pnpm seed
pnpm dev
```

File `.env` đã được cấu hình cho database riêng `gymflow_rest` trên MariaDB XAMPP tại `127.0.0.1:3306`. `pnpm seed` nhập dữ liệu từ JSON nếu database đang trống; không xóa dữ liệu database đã có.

Mở `http://localhost:3000` và đăng nhập bằng một trong các tài khoản demo:

- Email: `admin@gymflow.vn`
- Mật khẩu: `demo123`

Tài khoản demo khác:

- `huy.pham@email.com` / `demo123` — Hội viên GYM-001
- `trainer@gymflow.vn` / `demo123` — Trainer

Các hồ sơ hội viên demo khác cũng đăng nhập bằng email trong hồ sơ và mật khẩu `demo123`. Khi Admin thêm hội viên mới, hãy đặt mật khẩu cho tài khoản mới ngay trong biểu mẫu.

Khi `DATABASE_URL` được cấu hình, REST API dùng MariaDB làm nơi lưu chính; file `.gymflow-data/gymflow.json` chỉ giữ bản sao local. Không xóa database `gymflow_rest` nếu muốn giữ dữ liệu SQL.

> Mật khẩu demo đang lưu dạng rõ trong schema mẫu; không dùng mật khẩu thật khi triển khai production.

## Kết nối từ máy khác

Để nhiều máy dùng chung dữ liệu, chạy API và MariaDB trên máy chủ có địa chỉ LAN cố định. Các máy khách mở web/API của máy chủ đó; không dùng `localhost` của từng máy khách. Nếu MariaDB có mật khẩu, cập nhật `DATABASE_URL` trong `.env`:

```env
DATABASE_URL=mysql://root:your-password@127.0.0.1:3306/gymflow_rest
JWT_SECRET=doi-secret-nay-khi-trien-khai
PORT=3000
```

Không mở cổng MariaDB trực tiếp ra Internet; cho máy khách truy cập thông qua API server.

## Lệnh phát triển và kiểm tra

```bash
pnpm check          # TypeScript check
pnpm test           # Vitest suite của starter
pnpm build          # Vite frontend + Express server production bundle
pnpm start          # Chạy bundle production
pnpm seed           # Import dữ liệu JSON vào MariaDB trống, không xóa database đã có
pnpm contract:test  # Kiểm tra login, health, dashboard, members, plans
```

Khi chạy `pnpm contract:test`, server phải đang lắng nghe ở port 3000. Có thể đổi địa chỉ bằng `BASE_URL=http://localhost:3000 pnpm contract:test`.

## REST API

Base URL: `http://localhost:3000/api/v1`.

Đăng nhập:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"admin@gymflow.vn","password":"demo123"}'
```

Gọi danh sách hội viên:

```bash
curl 'http://localhost:3000/api/v1/members?page=1&limit=10&status=active' \\
  -H 'Authorization: Bearer <token>'
```

Các resource chính: `auth`, `users`, `members`, `plans`, `memberships`, `trainers`, `schedules`, `checkins`, `payments`, `dashboard`. Danh sách endpoint và ví dụ response nằm tại `docs/api.md`, `docs/openapi.json` và có thể xem ngay trong màn hình **REST API Docs**.

### Response contract

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 9, "totalPages": 1 }
}
```

Lỗi:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": []
  }
}
```

## Phân quyền

| Vai trò | Quyền demo |
| --- | --- |
| Admin | Toàn quyền quản lý hệ thống và dữ liệu |
| Member | Chỉ xem hồ sơ, membership, lịch, check-in và thanh toán của chính mình |
| Trainer | Chỉ xem lịch của mình và thông tin liên hệ tối thiểu của hội viên được phân công; tạo/sửa lịch của mình |

## Cấu trúc project

```text
client/src/          React UI, routes, layout, API client
server/restApi.ts    RESTful API router v1
server/gymData.ts    Store và seed demo deterministic
drizzle/schema.ts    Mô hình MySQL-compatible
scripts/             contract-test
client/public/       logo mark, favicon và public OpenAPI contract
docs/                architecture, database, api, OpenAPI, demo script
```

## Demo trước lớp

1. Mở Dashboard: giải thích 4 KPI và hai biểu đồ lấy từ `/dashboard/summary`.
2. Mở Hội viên: tìm kiếm/lọc, chỉ ra pagination và nested membership.
3. Mở REST API Docs: giải thích method, base path, JWT và response shape.
4. Dùng tài khoản Admin gọi `POST /members` để tạo hội viên.
5. Gọi `POST /checkins`: API kiểm tra membership còn hạn và chặn check-in trùng.
6. Gọi `PATCH /checkins/:id/checkout`: API tự tính thời lượng.
7. Gọi `POST /payments`: tạo giao dịch; quay lại Dashboard giải thích doanh thu.
8. Đăng nhập bằng Trainer để kiểm tra chỉ thấy lịch được giao và nhận `403` ở dashboard/thanh toán; đăng nhập bằng Member để kiểm tra dữ liệu cá nhân và `403` khi xem hồ sơ hội viên khác.

Kịch bản chi tiết và các câu hỏi phản biện nằm ở `docs/demo-script.md`.

## Lưu ý nộp bài

- Không commit `.env` thật, token hoặc dữ liệu cá nhân thật.
- ZIP bàn giao nên loại `node_modules`, `dist`, `.manus-logs` và file secret.
- Đây là hệ thống demo học tập. Nếu triển khai thật, cần mã hóa password, refresh token rotation, audit log bền vững, database transactions, rate limit, HTTPS và secret manager.
>>>>>>> c12ae5c (GymFlow updates: member dashboard and trainer permissions)
