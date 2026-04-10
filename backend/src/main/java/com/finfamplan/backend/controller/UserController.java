package com.finfamplan.backend.controller;

import com.finfamplan.backend.model.User;
import com.finfamplan.backend.dto.UpdateUserRequest;
import jakarta.validation.Valid;
import com.finfamplan.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping("/family/{familyGroupId}")
    public List<User> getUsersByFamilyGroup(@PathVariable Long familyGroupId) {
        return userRepository.findByFamilyGroup_Id(familyGroupId);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id).map(user -> {
            String newEmail = updatedUser.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
            }
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setEmail(updatedUser.getEmail());
            return userRepository.save(user);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PutMapping("/{id}/password")
    public Map<String, String> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both currentPassword and newPassword are required");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        if (newPassword.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return Map.of("message", "Password updated successfully");
    }

    @PostMapping("/{id}/logout-all")
    public Map<String, String> logoutAll(@PathVariable Long id) {
        userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return Map.of("message", "All sessions terminated. Please log in again on each device.");
    }

    @PostMapping("/family/invite")
    public Map<String, Object> inviteToFamily(@RequestBody Map<String, Object> body) {
        Long inviterUserId = Long.valueOf(body.get("inviterUserId").toString());
        String email = body.get("email").toString().trim().toLowerCase();
        String roleStr = body.get("role").toString().toUpperCase();

        User inviter = userRepository.findById(inviterUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inviter not found"));

        if (inviter.getFamilyGroup() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inviter has no family group");
        }

        User invitee = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No account found with email: " + email + ". They must register first."));

        invitee.setFamilyGroup(inviter.getFamilyGroup());

        try {
            com.finfamplan.backend.model.Role role = com.finfamplan.backend.model.Role.valueOf(roleStr);
            invitee.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + roleStr);
        }

        userRepository.save(invitee);

        return Map.of(
                "success", true,
                "message", invitee.getFirstName() + " " + invitee.getLastName() + " added to your family."
        );
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }
}
