package dh13c8.nhom4.gym.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dh13c8.nhom4.gym.entity.Registration;
import dh13c8.nhom4.gym.service.RegistrationService;

@RestController
@RequestMapping("/api2025/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    /**
     * Đăng ký gói tập cho thành viên.
     * POST /api2025/registrations?role=&memberId=&packageId=
     */
    @PostMapping
    public ResponseEntity<?> registerPackage(@RequestParam String role, @RequestParam Long memberId,
            @RequestParam Long packageId) {
        try {
            Registration registration = registrationService.registerPackage(role, memberId, packageId);
            return ResponseEntity.status(HttpStatus.CREATED).body(registration);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Gia hạn gói tập.
     * POST /api2025/registrations/{id}/renew?role=
     */
    @PostMapping("/{id}/renew")
    public ResponseEntity<?> renewPackage(@PathVariable Long id, @RequestParam String role) {
        try {
            Registration registration = registrationService.renewPackage(role, id);
            return ResponseEntity.ok(registration);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Hủy đăng ký gói tập.
     * POST /api2025/registrations/{id}/cancel?role=
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRegistration(@PathVariable Long id, @RequestParam String role) {
        try {
            Registration registration = registrationService.cancelRegistration(role, id);
            return ResponseEntity.ok(registration);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Lấy danh sách đăng ký của thành viên.
     * GET /api2025/registrations/member/{memberId}
     */
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Registration>> getRegistrationsByMember(@PathVariable Long memberId) {
        List<Registration> registrations = registrationService.getRegistrationsByMember(memberId);
        return ResponseEntity.ok(registrations);
    }

    /**
     * Lấy tất cả đăng ký (tự động expire trước khi trả).
     * GET /api2025/registrations
     */
    @GetMapping
    public ResponseEntity<List<Registration>> getAllRegistrations() {
        registrationService.autoExpireRegistrations();
        List<Registration> registrations = registrationService.getRegistrationsByMember(null);
        // Vì không có method getAll nên tạm trả về empty hoặc cần bổ sung method
        // Tạm thời trả về message
        return ResponseEntity.ok(List.of());
    }
}
