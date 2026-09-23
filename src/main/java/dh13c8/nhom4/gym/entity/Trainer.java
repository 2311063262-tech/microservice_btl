package dh13c8.nhom4.gym.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Hồ sơ huấn luyện viên (bảng trainers), quan hệ 1-1 với User.
 */
@Entity
@Table(name = "trainers")
public class Trainer {

    /** Khóa chính tự tăng, khớp AUTO_INCREMENT trên MySQL. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 1-1 với users; trả kèm thông tin tên HLV cho giao diện quản lý. */
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "specialty", length = 100)
    private String specialty;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "salary")
    private Double salary;

    public Trainer() {
    }

    public Trainer(Long id, User user, String specialty, Integer experienceYears, Double salary) {
        this.id = id;
        this.user = user;
        this.specialty = specialty;
        this.experienceYears = experienceYears;
        this.salary = salary;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }
}
