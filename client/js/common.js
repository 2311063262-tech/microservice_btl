/**
 * Hàm dùng chung cho toàn bộ client Gym Management
 */

const API_BASE = "http://localhost:8080/api2025";
const API_KEY = "SECRET_KEY_123";

/**
 * Lấy headers mặc định cho các request (bao gồm API Key).
 * @returns {Object} Headers object
 */
function getHeaders() {
    return {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY
    };
}

/**
 * Kiểm tra quyền truy cập. Nếu user không có role phù hợp, chuyển về trang login.
 * @param {...string} roles - Danh sách role được phép (ADMIN, TRAINER, MEMBER)
 */
function requireRole(...roles) {
    const currentUser = getCurrentUser();
    
    // Kiểm tra user có đăng nhập không
    if (!currentUser) {
        alert("Vui lòng đăng nhập để tiếp tục!");
        window.location.href = "../index.html";
        return;
    }
    
    // Kiểm tra role
    if (!roles.includes(currentUser.role)) {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = "../index.html";
        return;
    }
}

/**
 * Lấy thông tin user hiện tại từ localStorage.
 * @returns {Object|null} User object hoặc null nếu chưa đăng nhập
 */
function getCurrentUser() {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
        return null;
    }
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

/**
 * Đăng xuất: xóa localStorage và chuyển về trang login.
 */
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../index.html";
}
