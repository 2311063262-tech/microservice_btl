# 🏋️ Gym Management System

Hệ thống quản lý phòng gym được xây dựng bằng **Spring Boot** (Backend) và **HTML/JS/Bootstrap 5** (Frontend).

## 📋 Mục lục
- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu trúc project](#cấu-trúc-project)
- [API Documentation](#api-documentation)
- [Tài khoản test](#tài-khoản-test)
- [Screenshots](#screenshots)

## ✨ Tính năng

### 🔐 Authentication & Authorization
- Đăng nhập với 3 role: **ADMIN**, **TRAINER**, **MEMBER**
- Phân quyền chi tiết cho từng chức năng
- API Key security cho tất cả endpoints (trừ login)

### 👥 Quản lý Users & Members
- CRUD users (ADMIN only)
- Quản lý thông tin hội viên (members)
- Tìm kiếm hội viên theo tên
- Profile management

### 💪 Quản lý Trainers (Huấn luyện viên)
- CRUD trainers
- Quản lý chuyên môn, kinh nghiệm, lương
- Xem danh sách lớp học của trainer

### 📦 Quản lý Gói tập (Packages)
- CRUD gói tập với giá, thời hạn, mô tả
- Tìm kiếm gói tập
- Đăng ký gói cho hội viên
- Gia hạn, hủy đăng ký
- Tự động expire gói hết hạn

### 🏃 Quản lý Lớp học (Classes)
- CRUD lớp học
- Phân công trainer
- Quản lý lịch học theo ngày trong tuần
- Giới hạn sĩ số
- Đăng ký/Hủy đăng ký lớp

### 🛠️ Quản lý Thiết bị (Equipments)
- CRUD thiết bị
- Quản lý trạng thái (OK, REPAIRING, BROKEN)
- Lọc theo trạng thái
- Upload ảnh thiết bị

### 📊 Business Logic
- Kiểm tra gói tập còn hiệu lực khi đăng ký lớp
- Kiểm tra sĩ số lớp trước khi đăng ký
- Validate giờ bắt đầu/kết thúc lớp học
- Tự động expire gói đăng ký khi hết hạn

## 🛠️ Công nghệ

### Backend
- **Java 17/21**
- **Spring Boot 3.2.0**
  - Spring Web
  - Spring Data JPA
  - Spring Boot DevTools
- **MySQL 8.0**
- **Maven**

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**
- **Bootstrap 5.3.0** (CDN)

## 💻 Yêu cầu hệ thống

- **JDK 17+** (Java Development Kit)
- **Maven 3.6+** hoặc IDE có sẵn Maven (IntelliJ IDEA, Eclipse)
- **MySQL 8.0+**
- **Web Browser** (Chrome, Firefox, Edge)
- **VS Code** với Live Server extension (optional, cho frontend)

## 📥 Cài đặt

### 1. Clone repository
```bash
git clone https://github.com/YOUR_USERNAME/gym-management.git
cd gym-management
```

### 2. Cấu hình Database

#### Tạo database MySQL:
```bash
mysql -u root -p < sql/gym_db.sql
```

Hoặc import thủ công file `sql/gym_db.sql` vào MySQL Workbench/phpMyAdmin.

#### Cấu hình kết nối (nếu cần):
Sửa file `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/gym_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3. Chạy Backend (Spring Boot)

#### Cách 1: Dùng IntelliJ IDEA (Khuyến nghị)
1. Open Project trong IntelliJ
2. Đợi Maven download dependencies
3. Right-click `GymManagementApplication.java` → Run
4. Backend chạy ở: http://localhost:8080

#### Cách 2: Dùng Maven Command Line
```bash
mvn clean install
mvn spring-boot:run
```

### 4. Chạy Frontend

#### Cách 1: Dùng VS Code Live Server
1. Mở VS Code
2. Cài extension "Live Server"
3. Right-click `client/index.html` → Open with Live Server
4. Browser tự động mở: http://127.0.0.1:5500/client/index.html

#### Cách 2: Dùng Python HTTP Server
```bash
cd client
python -m http.server 5500
```
Sau đó mở: http://127.0.0.1:5500/index.html

## 📁 Cấu trúc project

```
gym-management/
├── src/
│   └── main/
│       ├── java/dh13c8/nhom4/gym/
│       │   ├── config/                  # Configuration classes
│       │   │   ├── ApiKeyConfig.java
│       │   │   └── WebConfig.java       # CORS config
│       │   ├── controller/              # REST Controllers
│       │   │   ├── AuthController.java
│       │   │   ├── UserController.java
│       │   │   ├── MemberController.java
│       │   │   ├── TrainerController.java
│       │   │   ├── GymPackageController.java
│       │   │   ├── RegistrationController.java
│       │   │   ├── ClassSessionController.java
│       │   │   ├── ClassRegistrationController.java
│       │   │   └── EquipmentController.java
│       │   ├── entity/                  # JPA Entities
│       │   │   ├── User.java
│       │   │   ├── Member.java
│       │   │   ├── Trainer.java
│       │   │   ├── GymPackage.java
│       │   │   ├── Registration.java
│       │   │   ├── ClassSession.java
│       │   │   ├── ClassRegistration.java
│       │   │   ├── Equipment.java
│       │   │   └── (Enums...)
│       │   ├── interceptor/             # HTTP Interceptors
│       │   │   └── ApiKeyInterceptor.java
│       │   ├── repository/              # JPA Repositories
│       │   │   └── (8 Repository interfaces...)
│       │   ├── service/                 # Business Logic
│       │   │   └── (10 Service classes...)
│       │   └── GymManagementApplication.java  # Main class
│       └── resources/
│           └── application.properties   # App config
├── client/                              # Frontend
│   ├── js/
│   │   └── common.js                    # Common functions
│   ├── index.html                       # Login page
│   ├── accounts-info.html               # Test accounts info
│   └── login.js                         # Login logic
├── sql/
│   └── gym_db.sql                       # Database schema + sample data
├── pom.xml                              # Maven dependencies
├── ACCOUNTS.md                          # Test accounts documentation
└── README.md                            # This file
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api2025
```

### Authentication
Tất cả endpoints (trừ `/auth/login`) cần header:
```http
X-API-KEY: SECRET_KEY_123
Content-Type: application/json
```

### Endpoints chính

#### 🔐 Auth
```http
POST /auth/login          # Đăng nhập (không cần API Key)
```

#### 👥 Users
```http
GET    /users?role=ADMIN               # Danh sách users
GET    /users/{id}?role=ADMIN          # Chi tiết user
POST   /users?role=ADMIN               # Tạo user mới
PUT    /users/{id}?role=ADMIN          # Cập nhật user
DELETE /users/{id}?role=ADMIN          # Xóa user
```

#### 🏃 Members
```http
GET    /members?name=&page=0&size=10   # Tìm kiếm members
GET    /members/{id}                   # Chi tiết member
POST   /members?role=ADMIN             # Tạo member
PUT    /members/{id}?role=ADMIN        # Cập nhật member
DELETE /members/{id}?role=ADMIN        # Xóa member
```

#### 💪 Trainers
```http
GET    /trainers                       # Danh sách trainers
GET    /trainers/{id}                  # Chi tiết trainer
POST   /trainers?role=ADMIN            # Tạo trainer
PUT    /trainers/{id}?role=ADMIN       # Cập nhật trainer
DELETE /trainers/{id}?role=ADMIN       # Xóa trainer
```

#### 📦 Packages
```http
GET    /packages?name=&page=0&size=10  # Tìm kiếm gói
GET    /packages/{id}                  # Chi tiết gói
POST   /packages?role=ADMIN            # Tạo gói
PUT    /packages/{id}?role=ADMIN       # Cập nhật gói
DELETE /packages/{id}?role=ADMIN       # Xóa gói
```

#### 📝 Registrations
```http
POST   /registrations?role=ADMIN&memberId=1&packageId=1  # Đăng ký gói
POST   /registrations/{id}/renew?role=ADMIN              # Gia hạn
POST   /registrations/{id}/cancel?role=ADMIN             # Hủy
GET    /registrations/member/{memberId}                  # Lịch sử đăng ký
```

#### 🏋️ Class Sessions
```http
GET    /classes                        # Danh sách lớp
GET    /classes/{id}                   # Chi tiết lớp
GET    /classes/trainer/{trainerId}    # Lớp của trainer
GET    /classes/day/{day}              # Lớp theo ngày
POST   /classes?role=ADMIN             # Tạo lớp
PUT    /classes/{id}?role=ADMIN        # Cập nhật lớp
DELETE /classes/{id}?role=ADMIN        # Xóa lớp
```

#### 📋 Class Registrations
```http
POST   /classes/{classId}/members?role=ADMIN&memberId=1  # Đăng ký lớp
DELETE /classes/{classId}/members/{memberId}?role=ADMIN  # Hủy đăng ký
GET    /classes/{classId}/members                        # Danh sách học viên
```

#### 🛠️ Equipments
```http
GET    /equipments                     # Danh sách thiết bị
GET    /equipments/{id}                # Chi tiết thiết bị
GET    /equipments/status/{status}     # Lọc theo trạng thái
POST   /equipments?role=ADMIN          # Tạo thiết bị
PUT    /equipments/{id}?role=ADMIN     # Cập nhật thiết bị
DELETE /equipments/{id}?role=ADMIN     # Xóa thiết bị
POST   /equipments/{id}/upload-image?role=ADMIN  # Upload ảnh
```

## 🔑 Tài khoản test

Xem chi tiết trong file `ACCOUNTS.md` hoặc mở: http://127.0.0.1:5500/client/accounts-info.html

### Quick Reference:

| Role | Username | Password | Mô tả |
|------|----------|----------|-------|
| ADMIN | `admin` | `123456` | Quản trị viên |
| TRAINER | `trainer1` | `123456` | HLV Strength Training |
| TRAINER | `trainer2` | `123456` | HLV Yoga & Pilates |
| MEMBER | `member1` | `123456` | Hội viên nam |
| MEMBER | `member2` | `123456` | Hội viên nữ |

## 🖼️ Screenshots

### Login Page
![Login](_docs/login.png)

### Admin Dashboard
![Admin Dashboard](_docs/admin-dashboard.png)

### Member Management
![Members](_docs/members.png)

## 🐛 Troubleshooting

### Backend không khởi động
- Kiểm tra MySQL đang chạy: `mysql -u root -p`
- Kiểm tra port 8080 có bị chiếm: `netstat -ano | findstr :8080`
- Xem log lỗi trong console

### Frontend không kết nối Backend
- Kiểm tra backend đã chạy: http://localhost:8080
- Kiểm tra CORS trong `WebConfig.java`
- Mở DevTools (F12) xem lỗi Network

### API trả về 401
- Kiểm tra header `X-API-KEY: SECRET_KEY_123`
- Endpoint `/auth/login` KHÔNG cần API Key

## 👥 Contributors

- **Nhóm 4 - DH13C8**

## 📄 License

This project is for educational purposes.

## 📞 Contact

For questions or issues, please open an issue on GitHub.

---

Made with ❤️ by Nhóm 4
