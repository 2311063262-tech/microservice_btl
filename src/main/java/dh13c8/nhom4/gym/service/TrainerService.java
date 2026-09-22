package dh13c8.nhom4.gym.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dh13c8.nhom4.gym.entity.Trainer;
import dh13c8.nhom4.gym.entity.User;
import dh13c8.nhom4.gym.repository.TrainerRepository;
import dh13c8.nhom4.gym.repository.UserRepository;

@Service
public class TrainerService {

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    // ========== GET (ai cũng xem, không checkRole) ==========

    /**
     * Lấy danh sách tất cả huấn luyện viên.
     */
    public List<Trainer> getAllTrainers() {
        return trainerRepository.findAll();
    }

    /**
     * Lấy thông tin huấn luyện viên theo ID.
     */
    public Optional<Trainer> getTrainerById(Long id) {
        return trainerRepository.findById(id);
    }

    // ========== CRUD (chỉ ADMIN) ==========

    /**
     * Tạo mới huấn luyện viên: user phải tồn tại và chưa bị trainer khác sử dụng.
     */
    public Trainer createTrainer(Trainer trainer, String role) {
        userService.checkRole(role, "ADMIN");

        // Kiểm tra user tồn tại
        if (trainer.getUser() == null || trainer.getUser().getId() == null) {
            throw new IllegalArgumentException("User không được để trống");
        }

        User user = userRepository.findById(trainer.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        // Kiểm tra user đã được sử dụng bởi trainer khác chưa
        if (trainerRepository.findAll().stream()
                .anyMatch(t -> t.getUser().getId().equals(user.getId()))) {
            throw new IllegalArgumentException("User đã được sử dụng bởi trainer khác");
        }

        trainer.setUser(user);
        return trainerRepository.save(trainer);
    }

    /**
     * Cập nhật thông tin huấn luyện viên: specialty, experienceYears, salary.
     */
    public Trainer updateTrainer(Long id, Trainer trainerDetails, String role) {
        userService.checkRole(role, "ADMIN");

        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        trainer.setSpecialty(trainerDetails.getSpecialty());
        trainer.setExperienceYears(trainerDetails.getExperienceYears());
        trainer.setSalary(trainerDetails.getSalary());

        return trainerRepository.save(trainer);
    }

    /**
     * Xóa huấn luyện viên.
     */
    public boolean deleteTrainer(Long id, String role) {
        userService.checkRole(role, "ADMIN");

        if (trainerRepository.existsById(id)) {
            trainerRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
