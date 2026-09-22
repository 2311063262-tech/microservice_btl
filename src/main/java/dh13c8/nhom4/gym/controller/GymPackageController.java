package dh13c8.nhom4.gym.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

import dh13c8.nhom4.gym.entity.GymPackage;
import dh13c8.nhom4.gym.service.GymPackageService;

@RestController
@RequestMapping("/api2025/packages")
public class GymPackageController {

    @Autowired
    private GymPackageService gymPackageService;

    /**
     * Tìm kiếm gói tập theo tên (ai cũng xem).
     */
    @GetMapping
    public ResponseEntity<Page<GymPackage>> searchPackages(
            @RequestParam(required = false, defaultValue = "") String name, Pageable pageable) {
        Page<GymPackage> packages = gymPackageService.searchPackages(name, pageable);
        return ResponseEntity.ok(packages);
    }

    /**
     * Lấy thông tin gói tập theo ID (ai cũng xem).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPackageById(@PathVariable Long id) {
        Optional<GymPackage> gymPackage = gymPackageService.getPackageById(id);
        if (gymPackage.isPresent()) {
            return ResponseEntity.ok(gymPackage.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Package not found");
        }
    }

    /**
     * Tạo mới gói tập (chỉ ADMIN).
     */
    @PostMapping
    public ResponseEntity<?> createPackage(@RequestBody GymPackage gymPackage, @RequestParam String role) {
        try {
            GymPackage created = gymPackageService.createPackage(gymPackage, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Cập nhật gói tập (chỉ ADMIN).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePackage(@PathVariable Long id, @RequestBody GymPackage gymPackage,
            @RequestParam String role) {
        try {
            GymPackage updated = gymPackageService.updatePackage(id, gymPackage, role);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Xóa gói tập (chỉ ADMIN).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable Long id, @RequestParam String role) {
        try {
            boolean deleted = gymPackageService.deletePackage(id, role);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Package not found");
            }
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
