package dh13c8.nhom4.gym.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dh13c8.nhom4.gym.entity.ClassRegistration;
import dh13c8.nhom4.gym.entity.ClassSession;
import dh13c8.nhom4.gym.entity.Member;
import dh13c8.nhom4.gym.repository.ClassRegistrationRepository;
import dh13c8.nhom4.gym.repository.ClassSessionRepository;
import dh13c8.nhom4.gym.repository.MemberRepository;

@Service
public class ClassRegistrationService {

    @Autowired
    private ClassRegistrationRepository classRegistrationRepository;

    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private UserService userService;

    // ========== ĐĂNG KÝ LỚP TẬP ==========

    /**
     * Đăng ký tham gia lớp tập.
     * 
     * @param role           quyền người dùng (ADMIN hoặc MEMBER)
     * @param classSessionId ID lớp tập
     * @param memberId       ID thành viên
     * @return ClassRegistration đã tạo
     */
    public ClassRegistration registerToClass(String role, Long classSessionId, Long memberId) {
        userService.checkRole(role, "ADMIN", "MEMBER");

        // Kiểm tra lớp tồn tại
        ClassSession classSession = classSessionRepository.findById(classSessionId)
                .orElseThrow(() -> new IllegalArgumentException("ClassSession không tồn tại"));

        // Kiểm tra member tồn tại
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member không tồn tại"));

        // Kiểm tra đã đăng ký lớp này chưa
        if (classRegistrationRepository.existsByMemberIdAndClassSessionId(memberId, classSessionId)) {
            throw new IllegalStateException("Bạn đã đăng ký lớp này");
        }

        // Kiểm tra sĩ số lớp
        long currentCount = classRegistrationRepository.countByClassSessionId(classSessionId);
        if (currentCount >= classSession.getMaxCapacity()) {
            throw new IllegalStateException("Lớp đã đủ sĩ số");
        }

        // Kiểm tra có gói tập còn hiệu lực
        if (!registrationService.hasActivePackage(memberId)) {
            throw new IllegalStateException("Bạn cần gói tập còn hiệu lực");
        }

        // Tạo đăng ký lớp
        ClassRegistration classRegistration = new ClassRegistration();
        classRegistration.setClassSession(classSession);
        classRegistration.setMember(member);
        classRegistration.setRegisteredAt(LocalDateTime.now());

        return classRegistrationRepository.save(classRegistration);
    }

    /**
     * Hủy đăng ký lớp tập.
     * 
     * @param role     quyền người dùng (ADMIN hoặc MEMBER)
     * @param memberId ID thành viên
     * @param classId  ID lớp tập
     */
    public void unregisterFromClass(String role, Long memberId, Long classId) {
        userService.checkRole(role, "ADMIN", "MEMBER");

        // Tìm và xóa bản ghi
        List<ClassRegistration> registrations = classRegistrationRepository.findByMemberId(memberId);
        ClassRegistration toDelete = registrations.stream()
                .filter(r -> r.getClassSession().getId().equals(classId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đăng ký lớp"));

        classRegistrationRepository.delete(toDelete);
    }

    /**
     * Lấy danh sách thành viên của lớp.
     */
    public List<ClassRegistration> getMembersOfClass(Long classId) {
        return classRegistrationRepository.findAll().stream()
                .filter(r -> r.getClassSession().getId().equals(classId))
                .toList();
    }
}
