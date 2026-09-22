package dh13c8.nhom4.gym.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dh13c8.nhom4.gym.entity.GymPackage;

@Repository
public interface GymPackageRepository extends JpaRepository<GymPackage, Long> {

    Page<GymPackage> findByNameContainingIgnoreCase(String name, Pageable pageable);

}
