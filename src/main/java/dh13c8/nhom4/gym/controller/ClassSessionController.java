package dh13c8.nhom4.gym.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dh13c8.nhom4.gym.entity.ClassSession;
import dh13c8.nhom4.gym.service.ClassSessionService;

@RestController
@RequestMapping("/api2025/classes")
public class ClassSessionController {

    @Autowired
    private ClassSessionService classSessionService;

    /**
     * Lấy danh sách tất cả buổi lớp (ai cũng xem).
     */
    @GetMapping
    public ResponseEntity<List<ClassSession>> getAllSessions() {
        List<ClassSession> sessions = classSessionService.getAllSessions();
        return ResponseEntity.ok(sessions);
    }

    /**
     * Lấy buổi lớp theo ID (ai cũng xem).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSessionById(@PathVariable Long id) {
        Optional<ClassSession> session = classSessionService.getSessionById(id);
        if (session.isPresent()) {
            return ResponseEntity.ok(session.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ClassSession not found");
        }
    }

    /**
     * Lấy danh sách buổi lớp theo huấn luyện viên.
     * GET /api2025/classes/trainer/{trainerId}
     */
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<ClassSession>> getByTrainer(@PathVariable Long trainerId) {
        List<ClassSession> sessions = classSessionService.getByTrainer(trainerId);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Lấy danh sách buổi lớp theo ngày trong tuần.
     * GET /api2025/classes/day/{day}
     */
    @GetMapping("/day/{day}")
    public ResponseEntity<List<ClassSession>> getByDay(@PathVariable String day) {
        List<ClassSession> sessions = classSessionService.getByDay(day);
        return ResponseEntity.ok(sessions);
    }

    /**
     * Tạo mới buổi lớp (chỉ ADMIN).
     */
    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody ClassSession classSession, @RequestParam String role) {
        try {
            ClassSession created = classSessionService.createSession(classSession, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Cập nhật buổi lớp (chỉ ADMIN).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSession(@PathVariable Long id, @RequestBody ClassSession classSession,
            @RequestParam String role) {
        try {
            ClassSession updated = classSessionService.updateSession(id, classSession, role);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Xóa buổi lớp (chỉ ADMIN).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable Long id, @RequestParam String role) {
        try {
            boolean deleted = classSessionService.deleteSession(id, role);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ClassSession not found");
            }
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
