package dh13c8.nhom4.gym.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dh13c8.nhom4.gym.entity.GymPackage;
import dh13c8.nhom4.gym.entity.Member;
import dh13c8.nhom4.gym.entity.Registration;
import dh13c8.nhom4.gym.entity.RegistrationStatus;
import dh13c8.nhom4.gym.repository.GymPackageRepository;
import dh13c8.nhom4.gym.repository.MemberRepository;
import dh13c8.nhom4.gym.repository.RegistrationRepository;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private GymPackageRepository gymPackageRepository;

    @Autowired
    private UserService userService;

    // ========== ĐĂNG KÝ GÓI TẬP ==========

    /**
     * Đăng ký gói tập cho thành viên.
     * 
     * @param role      quyền người dùng (chỉ ADMIN)
     * @param memberId  ID thành viên
     * @param packageId ID gói tập
     * @return Registration đã tạo
     */
    public Registration registerPackage(String role, Long memberId, Long packageId) {
        userService.checkRole(role, "ADMIN");

        // Kiểm tra member tồn tại
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member không tồn tại"));

        // Kiểm tra package tồn tại
        GymPackage gymPackage = gymPackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package không tồn tại"));

        // Kiểm tra member đang có gói còn hiệu lực
        if (registrationRepository.existsByMemberIdAndStatus(memberId, RegistrationStatus.ACTIVE)) {
            throw new IllegalStateException("Thành viên đang có gói còn hiệu lực");
        }

        // Tạo đăng ký mới
        Registration registration = new Registration();
        registration.setMember(member);
        registration.setGymPackage(gymPackage);
        registration.setStartDate(LocalDate.now());
        registration.setEndDate(LocalDate.now().plusMonths(gymPackage.getDurationMonths()));
        registration.setStatus(RegistrationStatus.ACTIVE);

        return registrationRepository.save(registration);
    }

    /**
     * Gia hạn gói tập: chỉ gói EXPIRED hoặc CANCELLED được gia hạn.
     * 
     * @param role           quyền người dùng (chỉ ADMIN)
     * @param registrationId ID đăng ký
     * @return Registration đã gia hạn
     */
    public Registration renewPackage(String role, Long registrationId) {
        userService.checkRole(role, "ADMIN");

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration không tồn tại"));

        // Chỉ gia hạn gói EXPIRED hoặc CANCELLED
        if (registration.getStatus() != RegistrationStatus.EXPIRED
                && registration.getStatus() != RegistrationStatus.CANCELLED) {
            throw new IllegalStateException("Chỉ có thể gia hạn gói EXPIRED hoặc CANCELLED");
        }

        // Gia hạn
        LocalDate today = LocalDate.now();
        registration.setStartDate(today);
        registration.setEndDate(today.plusMonths(registration.getGymPackage().getDurationMonths()));
        registration.setStatus(RegistrationStatus.ACTIVE);

        return registrationRepository.save(registration);
    }

    /**
     * Hủy đăng ký: chỉ gói ACTIVE có thể hủy.
     * 
     * @param role quyền người dùng (chỉ ADMIN)
     * @param id   ID đăng ký
     * @return Registration đã hủy
     */
    public Registration cancelRegistration(String role, Long id) {
        userService.checkRole(role, "ADMIN");

        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Registration không tồn tại"));

        // Chỉ hủy gói ACTIVE
        if (registration.getStatus() != RegistrationStatus.ACTIVE) {
            throw new IllegalStateException("Chỉ có thể hủy gói ACTIVE");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        return registrationRepository.save(registration);
    }

    /**
     * Tự động chuyển các gói đã hết hạn sang EXPIRED.
     */
    public void autoExpireRegistrations() {
        LocalDate today = LocalDate.now();
        List<Registration> activeRegistrations = registrationRepository.findByStatus(RegistrationStatus.ACTIVE);

        for (Registration registration : activeRegistrations) {
            if (registration.getEndDate() != null && registration.getEndDate().isBefore(today)) {
                registration.setStatus(RegistrationStatus.EXPIRED);
                registrationRepository.save(registration);
            }
        }
    }

    // ========== GET ==========

    /**
     * Lấy danh sách đăng ký của thành viên (tự động expire trước khi trả về).
     */
    public List<Registration> getRegistrationsByMember(Long memberId) {
        autoExpireRegistrations();
        return registrationRepository.findByMemberId(memberId);
    }

    /**
     * Kiểm tra thành viên có gói còn hiệu lực không (tự động expire trước khi kiểm tra).
     */
    public boolean hasActivePackage(Long memberId) {
        autoExpireRegistrations();
        return registrationRepository.existsByMemberIdAndStatus(memberId, RegistrationStatus.ACTIVE);
    }
}
