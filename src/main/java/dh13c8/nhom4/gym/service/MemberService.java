package dh13c8.nhom4.gym.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import dh13c8.nhom4.gym.entity.Member;
import dh13c8.nhom4.gym.entity.User;
import dh13c8.nhom4.gym.repository.MemberRepository;
import dh13c8.nhom4.gym.repository.UserRepository;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    // ========== GET (ai cũng xem, không checkRole) ==========

    /**
     * Tìm kiếm thành viên theo tên (trong User.fullName).
     */
    public Page<Member> searchMembers(String name, Pageable pageable) {
        return memberRepository.searchByName(name, pageable);
    }

    /**
     * Lấy thông tin thành viên theo ID.
     */
    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }

    // ========== CRUD (chỉ ADMIN) ==========

    /**
     * Tạo mới thành viên: user phải tồn tại và chưa bị member khác sử dụng.
     */
    public Member createMember(Member member, String role) {
        userService.checkRole(role, "ADMIN");

        // Kiểm tra user tồn tại
        if (member.getUser() == null || member.getUser().getId() == null) {
            throw new IllegalArgumentException("User không được để trống");
        }

        User user = userRepository.findById(member.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        // Kiểm tra user đã được sử dụng bởi member khác chưa
        if (memberRepository.findAll().stream()
                .anyMatch(m -> m.getUser().getId().equals(user.getId()))) {
            throw new IllegalArgumentException("User đã được sử dụng bởi member khác");
        }

        member.setUser(user);
        return memberRepository.save(member);
    }

    /**
     * Cập nhật thông tin thành viên: dob, gender, address, avatarUrl, joinDate.
     */
    public Member updateMember(Long id, Member memberDetails, String role) {
        userService.checkRole(role, "ADMIN");

        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        member.setDob(memberDetails.getDob());
        member.setGender(memberDetails.getGender());
        member.setAddress(memberDetails.getAddress());
        member.setAvatarUrl(memberDetails.getAvatarUrl());
        member.setJoinDate(memberDetails.getJoinDate());

        return memberRepository.save(member);
    }

    /**
     * Xóa thành viên.
     */
    public boolean deleteMember(Long id, String role) {
        userService.checkRole(role, "ADMIN");

        if (memberRepository.existsById(id)) {
            memberRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
