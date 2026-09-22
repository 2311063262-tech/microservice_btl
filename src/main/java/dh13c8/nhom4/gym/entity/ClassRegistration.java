package dh13c8.nhom4.gym.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Đăng ký lớp tập (bảng class_registrations) — Entity riêng, không dùng @ManyToMany.
 */
@Entity
@Table(name = "class_registrations")
public class ClassRegistration {

    /** Khóa chính tự tăng, khớp AUTO_INCREMENT trên MySQL. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "member_id")
    @JsonBackReference
    private Member member;

    @ManyToOne
    @JoinColumn(name = "class_session_id")
    @JsonBackReference
    private ClassSession classSession;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    public ClassRegistration() {
    }

    public ClassRegistration(Long id, Member member, ClassSession classSession, LocalDateTime registeredAt) {
        this.id = id;
        this.member = member;
        this.classSession = classSession;
        this.registeredAt = registeredAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

    public ClassSession getClassSession() {
        return classSession;
    }

    public void setClassSession(ClassSession classSession) {
        this.classSession = classSession;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }
}
