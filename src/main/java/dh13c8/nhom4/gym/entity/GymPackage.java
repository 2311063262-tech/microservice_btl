package dh13c8.nhom4.gym.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Gói tập (bảng gym_packages).
 */
@Entity
@Table(name = "gym_packages")
public class GymPackage {

    /** Khóa chính tự tăng, khớp AUTO_INCREMENT trên MySQL. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    public GymPackage() {
    }

    public GymPackage(Long id, String name, Double price, Integer durationMonths, String description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.durationMonths = durationMonths;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getDurationMonths() {
        return durationMonths;
    }

    public void setDurationMonths(Integer durationMonths) {
        this.durationMonths = durationMonths;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
