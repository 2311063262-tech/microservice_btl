package dh13c8.nhom4.gym.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dh13c8.nhom4.gym.entity.User;
import dh13c8.nhom4.gym.service.AuthService;

@RestController
@RequestMapping("/api2025/auth")
@CrossOrigin(origins = {
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:63342",
    "http://127.0.0.1:63342",
    "http://localhost",
    "null"
})
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Đăng nhập: POST /api2025/auth/login
     *
     * @param user chứa username và password
     * @return 200 + user nếu đúng; 401 nếu sai
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        Optional<User> loggedInUser =
                authService.login(
                        user.getUsername(),
                        user.getPassword()
                );

        if (loggedInUser.isPresent()) {
            return ResponseEntity.ok(loggedInUser.get());
        } else {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Sai tài khoản hoặc mật khẩu!");
        }
    }
}