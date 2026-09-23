/**
 * ==========================================
 * GYM MANAGEMENT - LOGIN
 * ==========================================
 */

const LOGIN_API = "http://localhost:8080/api2025/auth/login";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorDiv = document.getElementById("errorMessage");


loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Xóa thông báo cũ
    errorDiv.style.display = "none";
    errorDiv.textContent = "";


    // Kiểm tra tài khoản
    if (username === "") {
        errorDiv.style.display = "block";
        errorDiv.textContent = "Vui lòng nhập tên đăng nhập!";
        usernameInput.focus();
        return;
    }


    // Kiểm tra mật khẩu
    if (password === "") {
        errorDiv.style.display = "block";
        errorDiv.textContent = "Vui lòng nhập mật khẩu!";
        passwordInput.focus();
        return;
    }


    console.log("Đang đăng nhập...");
    console.log("API:", LOGIN_API);
    console.log("Username:", username);


    try {

        const response = await fetch(LOGIN_API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })

        });


        console.log("HTTP Status:", response.status);


        // =====================================
        // ĐĂNG NHẬP THÀNH CÔNG
        // =====================================

        if (response.ok) {

            const user = await response.json();

            console.log("ĐĂNG NHẬP THÀNH CÔNG!");
            console.log("User:", user);
            console.log("Role:", user.role);


            // Lưu thông tin người đăng nhập
            localStorage.setItem(
                "currentUser",
                JSON.stringify(user)
            );


            // app.js listens for this event and opens the dashboard in-place.
            window.dispatchEvent(new CustomEvent("gym:login", { detail: user }));
            return;
        }


        // =====================================
        // SAI TÀI KHOẢN / MẬT KHẨU
        // =====================================

        if (response.status === 401) {

            errorDiv.style.display = "block";

            errorDiv.textContent =
                "Sai tài khoản hoặc mật khẩu!";

            return;
        }


        // =====================================
        // KHÔNG TÌM THẤY API
        // =====================================

        if (response.status === 404) {

            errorDiv.style.display = "block";

            errorDiv.textContent =
                "Không tìm thấy API đăng nhập!";

            return;
        }


        // =====================================
        // FORBIDDEN
        // =====================================

        if (response.status === 403) {

            errorDiv.style.display = "block";

            errorDiv.textContent =
                "Server từ chối yêu cầu (403)!";

            return;
        }


        // =====================================
        // LỖI SERVER
        // =====================================

        if (response.status >= 500) {

            errorDiv.style.display = "block";

            errorDiv.textContent =
                "Server đang xảy ra lỗi!";

            return;
        }


        // =====================================
        // LỖI KHÁC
        // =====================================

        const errorText = await response.text();

        errorDiv.style.display = "block";

        errorDiv.textContent =
            errorText ||
            `Đăng nhập thất bại! HTTP ${response.status}`;


    } catch (error) {

        console.error("Lỗi đăng nhập:", error);

        errorDiv.style.display = "block";

        errorDiv.textContent =
            "Không thể kết nối server!";
    }

});