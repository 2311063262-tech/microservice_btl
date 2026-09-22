package dh13c8.nhom4.gym.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dh13c8.nhom4.gym.entity.Trainer;

@Repository
public interface TrainerRepository extends JpaRepository<Trainer, Long> {

}
