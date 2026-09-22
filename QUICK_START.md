# ⚡ HƯỚNG DẪN NHANH - GYM MANAGEMENT SYSTEM

## 🎯 3 bước để chạy dự án:

### Bước 1️⃣: Import Database
```bash
mysql -u root -p < sql\gym_db.sql
```
✅ Database `gym_db` sẽ được tạo với dữ liệu mẫu sẵn

### Bước 2️⃣: Chạy Backend
- Mở **IntelliJ IDEA**
- Open project → Chọn thư mục `gym-management`
- Chạy `GymManagementApplication.java`
- ✅ Backend: http://localhost:8080

### Bước 3️⃣: Chạy Frontend
- Mở **VS Code**
- Open folder → Chọn thư mục `client`
- Right-click `index.html` → **Open with Live Server**
- ✅ Frontend: http://127.0.0.1:5500/client/index.html

---

## 🔑 Đăng nhập test:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `123456` | ADMIN |
| `trainer1` | `123456` | TRAINER |
| `member1` | `123456` | MEMBER |

📄 Xem chi tiết: `ACCOUNTS.md` hoặc http://127.0.0.1:5500/client/accounts-info.html

---

## 🚀 Push lên GitHub:

### 1. Tạo repo mới trên GitHub
- Truy cập: https://github.com/new
- Tên repo: `gym-management`
- ⚠️ **KHÔNG** chọn thêm README, .gitignore, license

### 2. Push code (thay YOUR_USERNAME)
```bash
cd c:\Users\admin\Documents\gym-management
git remote add origin https://github.com/YOUR_USERNAME/gym-management.git
git push -u origin main
```

### 3. Nhập GitHub Token
- Tạo token: https://github.com/settings/tokens
- Chọn scope: `repo`
- Copy token và paste khi Git hỏi password

📄 Xem hướng dẫn chi tiết: `PUSH_TO_GITHUB.md`

---

## 📦 Nội dung đã push:

```
✅ 54 files
✅ 4281+ dòng code
✅ Backend: 8 Entity + 8 Repo + 10 Service + 9 Controller
✅ Frontend: HTML/JS/Bootstrap 5
✅ Database: SQL với dữ liệu mẫu
✅ Documentation đầy đủ
```

---

## 🛠️ Tech Stack:

**Backend:**
- Java 17/21
- Spring Boot 3.2.0
- MySQL 8.0
- Maven

**Frontend:**
- HTML5 + JavaScript
- Bootstrap 5.3.0
- Fetch API

**Features:**
- REST API
- JWT-ready (API Key hiện tại)
- CORS enabled
- Pagination support
- File upload
- Auto-expire registrations

---

## 📞 Cần giúp?

- 📖 README đầy đủ: `README.md`
- 🔐 Tài khoản test: `ACCOUNTS.md`
- 🚀 Push GitHub: `PUSH_TO_GITHUB.md`
- 🐛 Lỗi thường gặp: `client/README.md`

---

## ✅ Checklist hoàn thành:

- [x] Database schema + dữ liệu mẫu
- [x] Backend API hoàn chỉnh
- [x] Frontend login page
- [x] CORS configuration
- [x] API Key security
- [x] Test accounts
- [x] Documentation
- [x] Git initialized
- [x] Ready to push GitHub

🎉 **Project đã sẵn sàng!**
