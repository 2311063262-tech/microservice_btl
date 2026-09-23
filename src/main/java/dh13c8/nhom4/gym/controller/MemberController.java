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

import dh13c8.nhom4.gym.entity.Member;
import dh13c8.nhom4.gym.service.MemberService;

@RestController
@RequestMapping("/api2025/members")
public class MemberController {

    @Autowired
    private MemberService memberService;

    /**
     * Tìm kiếm thành viên theo tên (ai cũng xem).
     */
    @GetMapping
    public ResponseEntity<Page<Member>> searchMembers(@RequestParam(required = false, defaultValue = "") String name,
            Pageable pageable) {
        Page<Member> members = memberService.searchMembers(name, pageable);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/inactive")
    public ResponseEntity<?> searchInactiveMembers(@RequestParam(required = false, defaultValue = "") String name,
            @RequestParam String role, Pageable pageable) {
        try {
            return ResponseEntity.ok(memberService.searchInactiveMembers(name, pageable, role));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restoreMember(@PathVariable Long id, @RequestParam String role) {
        try {
            return memberService.restoreMember(id, role) ? ResponseEntity.ok().build()
                    : ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not found");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    /**
     * Lấy thông tin thành viên theo ID (ai cũng xem).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getMemberById(@PathVariable Long id) {
        Optional<Member> member = memberService.getMemberById(id);
        if (member.isPresent()) {
            return ResponseEntity.ok(member.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not found");
        }
    }

    /**
     * Tạo mới thành viên (chỉ ADMIN).
     */
    @PostMapping
    public ResponseEntity<?> createMember(@RequestBody Member member, @RequestParam String role) {
        try {
            Member created = memberService.createMember(member, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Cập nhật thành viên (chỉ ADMIN).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMember(@PathVariable Long id, @RequestBody Member member,
            @RequestParam String role) {
        try {
            Member updated = memberService.updateMember(id, member, role);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Xóa thành viên (chỉ ADMIN).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@PathVariable Long id, @RequestParam String role) {
        try {
            boolean deleted = memberService.deleteMember(id, role);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not found");
            }
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
