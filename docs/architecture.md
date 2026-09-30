# Kiến trúc GymFlow

## Tổng quan

GymFlow dùng kiến trúc browser-rendered frontend kết hợp Express REST API. React/Vite chịu trách nhiệm hiển thị dashboard và form nghiệp vụ. Browser gọi `/api/v1/*` cùng origin nên không cần CORS trong demo. Express xử lý authentication, authorization, validation, nghiệp vụ và response contract.

```text
Browser / React UI
       |
       | HTTPS / same-origin JSON
       v
Express HTTP server
  ├── /api/health
  ├── /api/v1/auth/*
  ├── /api/v1/{resource}
  ├── auth middleware (JWT)
  ├── role middleware (Admin/Member/Trainer)
  ├── Zod validators
  ├── service/store layer
  └── Drizzle schema / MySQL-compatible persistence boundary
```

## Luồng một request

1. UI gọi `apiFetch()` và đính kèm `Authorization: Bearer <JWT>`.
2. Express parse JSON, chuyển request vào `/api/v1`.
3. Route auth giải mã JWT bằng `jose`, tìm user trong store và gắn `req.user`.
4. Role middleware kiểm tra vai trò trước các thao tác nhạy cảm.
5. Zod validate body/query/params.
6. Store/service kiểm tra business rule: membership còn hạn, check-in trùng, lịch trainer bị overlap, số tiền dương.
7. Response trả về `{ success, data, meta }` hoặc `{ success: false, error }`.
8. UI render optimistic feedback/toast và refresh query khi cần.

## Serving và caching

Frontend là SPA/CSR; Vite build ra `dist/public`. Express production server phục vụ static assets và API cùng image. Route manifest tách `/api/*` tới server, `/assets/*` tới static immutable và catch-all tới SPA fallback. API/private data không được cache dùng chung.

## Vì sao phù hợp SOA

- API resource-oriented, stateless, có contract độc lập với UI.
- Client khác như mobile hoặc service khác có thể dùng chung `/api/v1`.
- Authentication/authorization là cross-cutting middleware.
- Validation và status codes chuẩn hóa lỗi giữa các consumer.
- Các domain resource có thể tách thành service/module trong bước mở rộng.
- OpenAPI JSON tạo hợp đồng tích hợp và hỗ trợ kiểm thử contract.
