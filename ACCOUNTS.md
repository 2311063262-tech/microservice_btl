# 🔐 TÀI KHOẢN TEST - GYM MANAGEMENT SYSTEM

## 📋 Danh sách tài khoản mẫu

### 1. ADMIN (Quản trị viên)
```
Username: admin
Password: 123456
Role: ADMIN
Họ tên: Nguyễn Văn Admin
Email: admin@gym.local
Điện thoại: 0901000001
```

**Quyền hạn:**
- Quản lý toàn bộ hệ thống
- CRUD: Users, Members, Trainers, Packages, Registrations, Classes, Equipments
- Xem báo cáo, thống kê

---

### 2. TRAINER (Huấn luyện viên)

#### Trainer 1
```
Username: trainer1
Password: 123456
Role: TRAINER
Họ tên: Trần Minh Huấn
Chuyên môn: Strength Training
Kinh nghiệm: 5 năm
Email: trainer1@gym.local
Điện thoại: 0901000002
```

#### Trainer 2
```
Username: trainer2
Password: 123456
Role: TRAINER
Họ tên: Lê Thị Yoga
Chuyên môn: Yoga & Pilates
Kinh nghiệm: 3 năm
Email: trainer2@gym.local
Điện thoại: 0901000003
```

**Quyền hạn:**
- Xem lớp học của mình
- Xem danh sách học viên trong lớp
- Đăng ký học viên vào lớp

---

### 3. MEMBER (Hội viên)

#### Member 1
```
Username: member1
Password: 123456
Role: MEMBER
Họ tên: Phạm Quốc Hội
Ngày sinh: 12/05/2002
Giới tính: Nam
Địa chỉ: 12 Nguyễn Huệ, Q.1, TP.HCM
Email: member1@gym.local
Điện thoại: 0901000004
Ngày tham gia: 15/01/2025
Gói hiện tại: Gói 12 tháng (ACTIVE, hết hạn 15/02/2027)
```

#### Member 2
```
Username: member2
Password: 123456
Role: MEMBER
Họ tên: Đỗ Thị Lan
Ngày sinh: 03/11/2001
Giới tính: Nữ
Địa chỉ: 45 Lê Lợi, Q.3, TP.HCM
Email: member2@gym.local
Điện thoại: 0901000005
Ngày tham gia: 01/03/2025
Gói hiện tại: Gói 3 tháng (ACTIVE, hết hạn 01/06/2026)
```

**Quyền hạn:**
- Xem thông tin cá nhân
- Xem lịch sử đăng ký gói tập
- Đăng ký/Hủy đăng ký lớp học
- Xem lịch tập

---

## 🗄️ Dữ liệu mẫu khác

### Gói tập (Packages)
1. **Gói 1 tháng** - 500,000đ
2. **Gói 3 tháng** - 1,350,000đ (tiết kiệm 150k)
3. **Gói 6 tháng** - 2,400,000đ (kèm 2 buổi PT)
4. **Gói 12 tháng** - 4,200,000đ (kèm 8 buổi PT)

### Lớp học (Classes)
1. **HIIT Morning** - Thứ 2, 07:00-08:00 (Trainer: Trần Minh Huấn)
2. **Yoga Flow** - Thứ 4, 18:00-19:00 (Trainer: Lê Thị Yoga)
3. **Strength Circuit** - Thứ 6, 19:00-20:30 (Trainer: Trần Minh Huấn)
4. **Pilates Core** - Thứ 7, 09:00-10:00 (Trainer: Lê Thị Yoga)

### Thiết bị (Equipments)
1. **Treadmill** - 8 máy (Tình trạng: OK)
2. **Dumbbell Set** - 20 bộ (Tình trạng: OK)
3. **Cable Machine** - 4 máy (Tình trạng: Đang sửa chữa)
4. **Rowing Machine** - 3 máy (Tình trạng: Hỏng)
5. **Smith Machine** - 2 máy (Tình trạng: OK)

---

## 🚀 Cách import dữ liệu

### Cách 1: MySQL Command Line
```bash
mysql -u root -p < sql/gym_db.sql
```

### Cách 2: MySQL Workbench
1. Mở MySQL Workbench
2. File → Open SQL Script → chọn `sql/gym_db.sql`
3. Execute (⚡ icon hoặc Ctrl+Shift+Enter)

### Cách 3: phpMyAdmin
1. Mở phpMyAdmin
2. Tab "Import"
3. Choose File → chọn `sql/gym_db.sql`
4. Click "Go"

---

## 🔑 API Testing với Postman/Insomnia

### Headers bắt buộc (trừ login):
```json
{
  "X-API-KEY": "SECRET_KEY_123",
  "Content-Type": "application/json"
}
```

### Test login:
```http
POST http://localhost:8080/api2025/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

### Test get members (sau khi login):
```http
GET http://localhost:8080/api2025/members?name=&page=0&size=10
X-API-KEY: SECRET_KEY_123
```

---

## 📝 Lưu ý

- **Mật khẩu**: Tất cả tài khoản đều dùng mật khẩu `123456` (chưa hash, để test dễ)
- **API Key**: `SECRET_KEY_123` (cấu hình trong `application.properties`)
- **CORS**: Đã cho phép origin `http://127.0.0.1:5500` và `http://localhost:5500`
- **Port**: Backend chạy ở `8080`, Frontend chạy ở `5500`

---

## 🎯 Test Flow đề xuất

1. **Login với ADMIN** → Thấy dashboard, quản lý toàn bộ
2. **Login với TRAINER1** → Thấy lớp học của mình (HIIT Morning, Strength Circuit)
3. **Login với MEMBER1** → Thấy thông tin cá nhân, gói tập còn hiệu lực
4. **ADMIN tạo user mới** → Test CRUD
5. **ADMIN đăng ký gói cho member** → Test registration flow
6. **MEMBER đăng ký lớp học** → Test class registration với validation gói tập

---

## 🐛 Troubleshooting

**Q: Login bị lỗi 401 "API Key invalid"?**
A: Endpoint `/auth/login` không cần API Key. Kiểm tra URL có đúng không.

**Q: Login thành công nhưng không redirect?**
A: Kiểm tra Console (F12) xem có lỗi JavaScript không. Kiểm tra user.role có đúng không.

**Q: Các endpoint khác bị 401?**
A: Các endpoint sau khi login cần header `X-API-KEY: SECRET_KEY_123`
