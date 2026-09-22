package dh13c8.nhom4.gym.service;

import java.util.List;

import org.springframework.stereotype.Service;

import dh13c8.nhom4.gym.entity.User;
import dh13c8.nhom4.gym.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Kiểm tra quyền dùng chung toàn dự án. */
    public void checkRole(String role, String... allowedRoles) {
        if (role == null || role.isBlank()) {
            throw new SecurityException("Bạn không có quyền thực hiện thao tác này");
        }
        if (allowedRoles == null || allowedRoles.length == 0) {
            throw new SecurityException("Bạn không có quyền thực hiện thao tác này");
        }
        for (String allowed : allowedRoles) {
            if (role.equals(allowed)) {
                return;
            }
        }
        throw new SecurityException("Bạn không có quyền thực hiện thao tác này");
    }

    public List<User> getAllUsers(String role) {
        checkRole(role, "ADMIN");
        return userRepository.findAll();
    }

    public User getUserById(Long id, String role) {
        checkRole(role, "ADMIN");
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user id=" + id));
    }

    public User createUser(User data, String role) {
        checkRole(role, "ADMIN");
        if (data.getUsername() == null || data.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username không được để trống");
        }
        if (userRepository.findByUsername(data.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        data.setId(null);
        return userRepository.save(data);
    }

    public User updateUser(Long id, User data, String role) {
        checkRole(role, "ADMIN");
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user id=" + id));
        if (data.getUsername() != null && !data.getUsername().equals(existing.getUsername())
                && userRepository.findByUsername(data.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        if (data.getUsername() != null) {
            existing.setUsername(data.getUsername());
        }
        if (data.getPassword() != null) {
            existing.setPassword(data.getPassword());
        }
        if (data.getRole() != null) {
            existing.setRole(data.getRole());
        }
        if (data.getFullName() != null) {
            existing.setFullName(data.getFullName());
        }
        if (data.getEmail() != null) {
            existing.setEmail(data.getEmail());
        }
        if (data.getPhone() != null) {
            existing.setPhone(data.getPhone());
        }
        return userRepository.save(existing);
    }

    public void deleteUser(Long id, String role) {
        checkRole(role, "ADMIN");
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy user id=" + id);
        }
        userRepository.deleteById(id);
    }
}
