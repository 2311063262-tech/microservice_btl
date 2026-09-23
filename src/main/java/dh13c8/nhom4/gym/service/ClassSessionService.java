package dh13c8.nhom4.gym.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dh13c8.nhom4.gym.entity.ClassSession;
import dh13c8.nhom4.gym.repository.ClassSessionRepository;

@Service
public class ClassSessionService {

    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private UserService userService;

    // ========== GET (ai cũng xem, không checkRole) ==========

    /**
     * Lấy danh sách tất cả buổi lớp.
     */
    public List<ClassSession> getAllSessions() {
        return classSessionRepository.findAll();
    }

    /**
     * Lấy thông tin buổi lớp theo ID.
     */
    public Optional<ClassSession> getSessionById(Long id) {
        return classSessionRepository.findById(id);
    }

    /**
     * Lấy danh sách buổi lớp theo huấn luyện viên.
     */
    public List<ClassSession> getByTrainer(Long trainerId) {
        return classSessionRepository.findByTrainerId(trainerId);
    }

    /**
     * Lấy danh sách buổi lớp theo ngày trong tuần.
     */
    public List<ClassSession> getByDay(String day) {
        return classSessionRepository.findByDayOfWeek(day);
    }

    // ========== CRUD (chỉ ADMIN) ==========

    /**
     * Tạo mới buổi lớp. Validate start_time < end_time.
     */
    public ClassSession createSession(ClassSession classSession, String role) {
        userService.checkRole(role, "ADMIN");

        // Validate giờ bắt đầu < giờ kết thúc
        if (classSession.getStartTime() != null && classSession.getEndTime() != null
                && !classSession.getStartTime().isBefore(classSession.getEndTime())) {
            throw new IllegalArgumentException("Giờ kết thúc phải sau giờ bắt đầu");
        }

        return classSessionRepository.save(classSession);
    }

    /**
     * Cập nhật buổi lớp. Validate start_time < end_time.
     */
    public ClassSession updateSession(Long id, ClassSession sessionDetails, String role) {
        userService.checkRole(role, "ADMIN");

        ClassSession classSession = classSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ClassSession not found"));

        // Validate giờ bắt đầu < giờ kết thúc
        if (sessionDetails.getStartTime() != null && sessionDetails.getEndTime() != null
                && !sessionDetails.getStartTime().isBefore(sessionDetails.getEndTime())) {
            throw new IllegalArgumentException("Giờ kết thúc phải sau giờ bắt đầu");
        }

        classSession.setName(sessionDetails.getName());
        if (sessionDetails.getTrainer() != null) {
            classSession.setTrainer(sessionDetails.getTrainer());
        }
        classSession.setDayOfWeek(sessionDetails.getDayOfWeek());
        classSession.setStartTime(sessionDetails.getStartTime());
        classSession.setEndTime(sessionDetails.getEndTime());
        classSession.setMaxCapacity(sessionDetails.getMaxCapacity());

        return classSessionRepository.save(classSession);
    }

    /**
     * Xóa buổi lớp.
     */
    public boolean deleteSession(Long id, String role) {
        userService.checkRole(role, "ADMIN");

        if (classSessionRepository.existsById(id)) {
            classSessionRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
