package dh13c8.nhom4.gym.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dh13c8.nhom4.gym.entity.Registration;
import dh13c8.nhom4.gym.entity.RegistrationStatus;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByMemberId(Long memberId);

    boolean existsByMemberIdAndStatus(Long memberId, RegistrationStatus status);

    List<Registration> findByStatus(RegistrationStatus status);

}
