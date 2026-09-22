package dh13c8.nhom4.gym.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import dh13c8.nhom4.gym.entity.Member;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    @Query("SELECT m FROM Member m WHERE LOWER(m.user.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Member> searchByName(@Param("name") String name, Pageable pageable);

}
