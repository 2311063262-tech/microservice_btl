package dh13c8.nhom4.gym.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dh13c8.nhom4.gym.entity.ClassSession;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {

    List<ClassSession> findByTrainerId(Long trainerId);

    List<ClassSession> findByDayOfWeek(String day);

}
