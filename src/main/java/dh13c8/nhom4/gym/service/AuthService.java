package dh13c8.nhom4.gym.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import dh13c8.nhom4.gym.entity.User;
import dh13c8.nhom4.gym.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> login(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(u -> u.getPassword().equals(password));
    }
}
