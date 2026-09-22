package dh13c8.nhom4.gym.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dh13c8.nhom4.gym.entity.ClassRegistration;

@Repository
public interface ClassRegistrationRepository extends JpaRepository<ClassRegistration, Long> {

    boolean existsByMemberIdAndClassSessionId(Long memberId, Long classSessionId);

    long countByClassSessionId(Long classSessionId);

    List<ClassRegistration> findByMemberId(Long memberId);

}
