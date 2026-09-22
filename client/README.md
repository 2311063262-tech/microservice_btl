# Hướng dẫn chạy Gym Management System

## Yêu cầu:
1. **Java 17+** (đã có Java 21 ✓)
2. **Maven** hoặc **IntelliJ IDEA** (có sẵn Maven wrapper)
3. **MySQL Server** đang chạy ở localhost:3306
4. **Live Server** extension trong VS Code (hoặc trình duyệt)

## Bước 1: Cài đặt Database

Chạy file SQL để tạo database và tables:
```bash
mysql -u root -p < sql/gym_db.sql
```

Hoặc import thủ công vào MySQL Workbench/phpMyAdmin.

## Bước 2: Chạy Backend (Spring Boot)

### Cách 1: Dùng IntelliJ IDEA (Khuyến nghị)
1. Mở project trong IntelliJ IDEA
2. Right-click vào `GymManagementApplication.java`
3. Chọn "Run 'GymManagementApplication'"
4. Đợi server khởi động ở port 8080

### Cách 2: Dùng Maven Command Line
```bash
cd c:\Users\admin\Documents\gym-management
mvn clean install
mvn spring-boot:run
```

### Cách 3: Dùng Maven Wrapper (nếu có)
```bash
./mvnw spring-boot:run
```

Backend sẽ chạy ở: http://localhost:8080

## Bước 3: Chạy Frontend (HTML/JS)

### Cách 1: Dùng VS Code Live Server (Khuyến nghị)
1. Mở VS Code
2. Cài extension "Live Server" (nếu chưa có)
3. Right-click vào `client/index.html`
4. Chọn "Open with Live Server"
5. Browser tự động mở: http://127.0.0.1:5500/client/index.html

### Cách 2: Dùng trình duyệt trực tiếp
1. Double-click vào `client/index.html`
2. **Lưu ý**: CORS có thể không hoạt động với file://

## Bước 4: Test đăng nhập

Sử dụng tài khoản từ database:
- Username: `admin`
- Password: (tùy theo dữ liệu trong SQL)

## Cấu trúc API:

Base URL: `http://localhost:8080/api2025`

### Authentication:
- **POST** `/auth/login` - Đăng nhập (không cần API Key)

### Headers cho các endpoint khác:
```json
{
  "X-API-KEY": "SECRET_KEY_123",
  "Content-Type": "application/json"
}
```

## Troubleshooting:

### 1. Backend không chạy được:
- Kiểm tra MySQL đang chạy: `mysql -u root -p`
- Kiểm tra port 8080 có bị chiếm không: `netstat -ano | findstr :8080`
- Xem log lỗi trong console

### 2. Frontend không kết nối được backend:
- Kiểm tra backend đã chạy: http://localhost:8080
- Kiểm tra CORS đã được cấu hình trong WebConfig
- Mở DevTools (F12) xem lỗi Console/Network

### 3. API Key invalid:
- Kiểm tra header `X-API-KEY: SECRET_KEY_123`
- Endpoint `/auth/login` KHÔNG cần API Key

## API Endpoints chính:

### Auth (không cần API Key)
- POST `/auth/login` - Đăng nhập

### Users (cần API Key + role ADMIN)
- GET `/users?role=ADMIN` - Danh sách users
- POST `/users?role=ADMIN` - Tạo user mới

### Members (GET public, CRUD cần ADMIN)
- GET `/members?name=&page=0&size=10` - Tìm kiếm
- POST `/members?role=ADMIN` - Tạo member

### Trainers
- GET `/trainers` - Danh sách trainers
- POST `/trainers?role=ADMIN` - Tạo trainer

### Packages
- GET `/packages?name=&page=0&size=10` - Tìm kiếm gói
- POST `/packages?role=ADMIN` - Tạo gói

### Registrations
- POST `/registrations?role=ADMIN&memberId=1&packageId=1` - Đăng ký gói
- POST `/registrations/{id}/renew?role=ADMIN` - Gia hạn
- POST `/registrations/{id}/cancel?role=ADMIN` - Hủy

### Classes
- GET `/classes` - Danh sách lớp
- POST `/classes?role=ADMIN` - Tạo lớp
- GET `/classes/trainer/{id}` - Lớp của trainer
- GET `/classes/day/{day}` - Lớp theo ngày

### Class Registration
- POST `/classes/{classId}/members?role=ADMIN&memberId=1` - Đăng ký lớp
- DELETE `/classes/{classId}/members/{memberId}?role=ADMIN` - Hủy đăng ký

### Equipments
- GET `/equipments` - Danh sách thiết bị
- GET `/equipments/status/{status}` - Lọc theo trạng thái
- POST `/equipments/{id}/upload-image?role=ADMIN` - Upload ảnh
