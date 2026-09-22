package dh13c8.nhom4.gym.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dh13c8.nhom4.gym.entity.Trainer;
import dh13c8.nhom4.gym.service.TrainerService;

@RestController
@RequestMapping("/api2025/trainers")
public class TrainerController {

    @Autowired
    private TrainerService trainerService;

    /**
     * Lấy danh sách tất cả huấn luyện viên (ai cũng xem).
     */
    @GetMapping
    public ResponseEntity<List<Trainer>> getAllTrainers() {
        List<Trainer> trainers = trainerService.getAllTrainers();
        return ResponseEntity.ok(trainers);
    }

    /**
     * Lấy thông tin huấn luyện viên theo ID (ai cũng xem).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTrainerById(@PathVariable Long id) {
        Optional<Trainer> trainer = trainerService.getTrainerById(id);
        if (trainer.isPresent()) {
            return ResponseEntity.ok(trainer.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trainer not found");
        }
    }

    /**
     * Tạo mới huấn luyện viên (chỉ ADMIN).
     */
    @PostMapping
    public ResponseEntity<?> createTrainer(@RequestBody Trainer trainer, @RequestParam String role) {
        try {
            Trainer created = trainerService.createTrainer(trainer, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Cập nhật huấn luyện viên (chỉ ADMIN).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrainer(@PathVariable Long id, @RequestBody Trainer trainer,
            @RequestParam String role) {
        try {
            Trainer updated = trainerService.updateTrainer(id, trainer, role);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Xóa huấn luyện viên (chỉ ADMIN).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrainer(@PathVariable Long id, @RequestParam String role) {
        try {
            boolean deleted = trainerService.deleteTrainer(id, role);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trainer not found");
            }
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
