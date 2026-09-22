/**
 * Xử lý đăng nhập
 */

document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("errorMessage");
    
    // Ẩn lỗi cũ
    errorDiv.style.display = "none";
    errorDiv.textContent = "";
    
    try {
        // Gọi API login (KHÔNG cần X-API-KEY)
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        if (response.ok) {
            // Đăng nhập thành công
            const user = await response.json();
            
            // Lưu vào localStorage
            localStorage.setItem("currentUser", JSON.stringify(user));
            
            // Điều hướng theo role
            switch (user.role) {
                case "ADMIN":
                    window.location.href = "admin/dashboard.html";
                    break;
                case "TRAINER":
                    window.location.href = "trainer/my-classes.html";
                    break;
                case "MEMBER":
                    window.location.href = "member/my-info.html";
                    break;
                default:
                    errorDiv.style.display = "block";
                    errorDiv.textContent = "Role không hợp lệ!";
            }
        } else if (response.status === 401) {
            // Sai tài khoản hoặc mật khẩu
            errorDiv.style.display = "block";
            errorDiv.textContent = "Sai tài khoản hoặc mật khẩu!";
        } else {
            // Lỗi khác
            const errorText = await response.text();
            errorDiv.style.display = "block";
            errorDiv.textContent = errorText || "Đã xảy ra lỗi!";
        }
    } catch (error) {
        // Lỗi mạng
        console.error("Login error:", error);
        errorDiv.style.display = "block";
        errorDiv.textContent = "Không thể kết nối server!";
    }
});
