package dh13c8.nhom4.gym.controller;

import java.io.IOException;
import java.util.List;
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
import org.springframework.web.multipart.MultipartFile;

import dh13c8.nhom4.gym.entity.Equipment;
import dh13c8.nhom4.gym.entity.EquipmentStatus;
import dh13c8.nhom4.gym.service.EquipmentService;
import dh13c8.nhom4.gym.service.FileStorageService;

@RestController
@RequestMapping("/api2025/equipments")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Lấy danh sách tất cả thiết bị (ai cũng xem).
     */
    @GetMapping
    public ResponseEntity<?> getAllEquipments(@RequestParam(required = false) String name, Pageable pageable) {
        if (name != null && !name.isEmpty()) {
            Page<Equipment> equipments = equipmentService.searchEquipments(name, pageable);
            return ResponseEntity.ok(equipments);
        } else {
            List<Equipment> equipments = equipmentService.getAllEquipments();
            return ResponseEntity.ok(equipments);
        }
    }

    /**
     * Lấy thiết bị theo ID (ai cũng xem).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getEquipmentById(@PathVariable Long id) {
        Optional<Equipment> equipment = equipmentService.getEquipmentById(id);
        if (equipment.isPresent()) {
            return ResponseEntity.ok(equipment.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Equipment not found");
        }
    }

    /**
     * Lấy danh sách thiết bị theo trạng thái (ai cũng xem).
     * GET /api2025/equipments/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Equipment>> getEquipmentsByStatus(@PathVariable EquipmentStatus status) {
        List<Equipment> equipments = equipmentService.findByStatus(status);
        return ResponseEntity.ok(equipments);
    }

    /**
     * Tạo mới thiết bị (chỉ ADMIN).
     */
    @PostMapping
    public ResponseEntity<?> createEquipment(@RequestBody Equipment equipment, @RequestParam String role) {
        try {
            Equipment created = equipmentService.createEquipment(equipment, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Cập nhật thiết bị (chỉ ADMIN).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEquipment(@PathVariable Long id, @RequestBody Equipment equipment,
            @RequestParam String role) {
        try {
            Equipment updated = equipmentService.updateEquipment(id, equipment, role);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Xóa thiết bị (chỉ ADMIN).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipment(@PathVariable Long id, @RequestParam String role) {
        try {
            boolean deleted = equipmentService.deleteEquipment(id, role);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Equipment not found");
            }
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Upload ảnh thiết bị.
     * POST /api2025/equipments/{id}/upload-image?role=
     */
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file,
            @RequestParam String role) {
        try {
            // Kiểm tra quyền
            if (role == null || !role.equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Bạn không có quyền thực hiện thao tác này");
            }

            // Lưu file
            String imageUrl = fileStorageService.saveFile(file);

            // Cập nhật imageUrl cho thiết bị
            Optional<Equipment> equipmentOpt = equipmentService.getEquipmentById(id);
            if (equipmentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Equipment not found");
            }

            Equipment equipment = equipmentOpt.get();
            equipment.setImageUrl(imageUrl);
            Equipment updated = equipmentService.updateEquipment(id, equipment, role);

            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi lưu file: " + e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
