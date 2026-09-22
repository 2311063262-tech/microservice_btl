package dh13c8.nhom4.gym.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import dh13c8.nhom4.gym.entity.GymPackage;
import dh13c8.nhom4.gym.repository.GymPackageRepository;

@Service
public class GymPackageService {

    @Autowired
    private GymPackageRepository gymPackageRepository;

    @Autowired
    private UserService userService;

    // ========== GET (ai cũng xem, không checkRole) ==========

    /**
     * Tìm kiếm gói tập theo tên.
     */
    public Page<GymPackage> searchPackages(String name, Pageable pageable) {
        return gymPackageRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    /**
     * Lấy thông tin gói tập theo ID.
     */
    public Optional<GymPackage> getPackageById(Long id) {
        return gymPackageRepository.findById(id);
    }

    // ========== CRUD (chỉ ADMIN) ==========

    /**
     * Tạo mới gói tập.
     */
    public GymPackage createPackage(GymPackage gymPackage, String role) {
        userService.checkRole(role, "ADMIN");
        return gymPackageRepository.save(gymPackage);
    }

    /**
     * Cập nhật thông tin gói tập: name, price, durationMonths, description.
     */
    public GymPackage updatePackage(Long id, GymPackage packageDetails, String role) {
        userService.checkRole(role, "ADMIN");

        GymPackage gymPackage = gymPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        gymPackage.setName(packageDetails.getName());
        gymPackage.setPrice(packageDetails.getPrice());
        gymPackage.setDurationMonths(packageDetails.getDurationMonths());
        gymPackage.setDescription(packageDetails.getDescription());

        return gymPackageRepository.save(gymPackage);
    }

    /**
     * Xóa gói tập.
     */
    public boolean deletePackage(Long id, String role) {
        userService.checkRole(role, "ADMIN");

        if (gymPackageRepository.existsById(id)) {
            gymPackageRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
