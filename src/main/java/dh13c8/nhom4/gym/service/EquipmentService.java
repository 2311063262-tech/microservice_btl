package dh13c8.nhom4.gym.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import dh13c8.nhom4.gym.entity.Equipment;
import dh13c8.nhom4.gym.entity.EquipmentStatus;
import dh13c8.nhom4.gym.repository.EquipmentRepository;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserService userService;

    // ========== GET (ai cũng xem, không checkRole) ==========

    /**
     * Lấy danh sách tất cả thiết bị.
     */
    public List<Equipment> getAllEquipments() {
        return equipmentRepository.findAll();
    }

    /**
     * Lấy thông tin thiết bị theo ID.
     */
    public Optional<Equipment> getEquipmentById(Long id) {
        return equipmentRepository.findById(id);
    }

    /**
     * Lấy danh sách thiết bị theo trạng thái.
     */
    public List<Equipment> findByStatus(EquipmentStatus status) {
        return equipmentRepository.findByStatus(status);
    }

    /**
     * Tìm kiếm thiết bị theo tên.
     */
    public Page<Equipment> searchEquipments(String name, Pageable pageable) {
        return equipmentRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    // ========== CRUD (chỉ ADMIN) ==========

    /**
     * Tạo mới thiết bị.
     */
    public Equipment createEquipment(Equipment equipment, String role) {
        userService.checkRole(role, "ADMIN");
        return equipmentRepository.save(equipment);
    }

    /**
     * Cập nhật thông tin thiết bị.
     */
    public Equipment updateEquipment(Long id, Equipment equipmentDetails, String role) {
        userService.checkRole(role, "ADMIN");

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        equipment.setName(equipmentDetails.getName());
        equipment.setQuantity(equipmentDetails.getQuantity());
        equipment.setStatus(equipmentDetails.getStatus());
        if (equipmentDetails.getImageUrl() != null && !equipmentDetails.getImageUrl().isBlank()) {
            equipment.setImageUrl(equipmentDetails.getImageUrl());
        }

        return equipmentRepository.save(equipment);
    }

    /**
     * Xóa thiết bị.
     */
    public boolean deleteEquipment(Long id, String role) {
        userService.checkRole(role, "ADMIN");

        if (equipmentRepository.existsById(id)) {
            equipmentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
