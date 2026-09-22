package dh13c8.nhom4.gym.entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Đăng ký gói tập (bảng registrations) — Entity riêng, không dùng @ManyToMany.
 */
@Entity
@Table(name = "registrations")
public class Registration {

    /** Khóa chính tự tăng, khớp AUTO_INCREMENT trên MySQL. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nhiều đăng ký thuộc một hội viên. */
    @ManyToOne
    @JoinColumn(name = "member_id")
    @JsonBackReference
    private Member member;

    /** package là keyword Java nên field đặt tên gymPackage, cột SQL vẫn là package_id. */
    @ManyToOne
    @JoinColumn(name = "package_id")
    @JsonBackReference
    private GymPackage gymPackage;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private RegistrationStatus status;

    public Registration() {
    }

    public Registration(Long id, Member member, GymPackage gymPackage, LocalDate startDate, LocalDate endDate,
            RegistrationStatus status) {
        this.id = id;
        this.member = member;
        this.gymPackage = gymPackage;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
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

    public GymPackage getGymPackage() {
        return gymPackage;
    }

    public void setGymPackage(GymPackage gymPackage) {
        this.gymPackage = gymPackage;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }
}
