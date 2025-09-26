package com.finfamplan.backend.controller;

import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET user by ID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id).orElseThrow();
    }

    // CREATE user
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // UPDATE user
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setEmail(updatedUser.getEmail());
            user.setPassword(updatedUser.getPassword());
            user.setRole(updatedUser.getRole());
            return userRepository.save(user);
        }).orElseThrow();
    }

    // DELETE user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }
}
