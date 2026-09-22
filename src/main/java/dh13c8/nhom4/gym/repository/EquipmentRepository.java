package dh13c8.nhom4.gym.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dh13c8.nhom4.gym.entity.Equipment;
import dh13c8.nhom4.gym.entity.EquipmentStatus;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByStatus(EquipmentStatus status);

    Page<Equipment> findByNameContainingIgnoreCase(String name, Pageable pageable);

}
