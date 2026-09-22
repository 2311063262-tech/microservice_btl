package dh13c8.nhom4.gym.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dh13c8.nhom4.gym.entity.ClassRegistration;
import dh13c8.nhom4.gym.service.ClassRegistrationService;

@RestController
@RequestMapping("/api2025/classes")
public class ClassRegistrationController {

    @Autowired
    private ClassRegistrationService classRegistrationService;

    /**
     * Đăng ký tham gia lớp tập.
     * POST /api2025/classes/{classId}/members?role=&memberId=
     */
    @PostMapping("/{classId}/members")
    public ResponseEntity<?> registerToClass(@PathVariable Long classId, @RequestParam String role,
            @RequestParam Long memberId) {
        try {
            ClassRegistration registration = classRegistrationService.registerToClass(role, classId, memberId);
            return ResponseEntity.status(HttpStatus.CREATED).body(registration);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Hủy đăng ký lớp tập.
     * DELETE /api2025/classes/{classId}/members/{memberId}?role=
     */
    @DeleteMapping("/{classId}/members/{memberId}")
    public ResponseEntity<?> unregisterFromClass(@PathVariable Long classId, @PathVariable Long memberId,
            @RequestParam String role) {
        try {
            classRegistrationService.unregisterFromClass(role, memberId, classId);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Lấy danh sách thành viên của lớp.
     * GET /api2025/classes/{classId}/members
     */
    @GetMapping("/{classId}/members")
    public ResponseEntity<List<ClassRegistration>> getMembersOfClass(@PathVariable Long classId) {
        List<ClassRegistration> members = classRegistrationService.getMembersOfClass(classId);
        return ResponseEntity.ok(members);
    }
}
