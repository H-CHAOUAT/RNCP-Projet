package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.LoginRequest;
import com.finfamplan.backend.dto.RegisterRequest;
import com.finfamplan.backend.model.Role;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // allow frontend
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return Map.of("success", false, "message", "Email already exists");
        }

        User u = new User();
        u.setFirstName(request.getFirstName());
        u.setLastName(request.getLastName());
        u.setEmail(request.getEmail());
        u.setPassword(encoder.encode(request.getPassword())); // encode password
        u.setRole(Role.valueOf(request.getRole().toUpperCase()));
        userRepository.save(u);

        return Map.of("success", true, "message", "User registered successfully");
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody @Valid LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    if (encoder.matches(request.getPassword(), user.getPassword())) {

                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getUserId());          // can be null in tests
                        userMap.put("email", user.getEmail());
                        userMap.put("role", user.getRole() != null ? user.getRole().name() : null);

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("message", "Login successful");
                        response.put("user", userMap);

                        return response;
                    }else {
                        return Map.<String, Object>of("success", false, "message", "Invalid password");
                    }
                })
                .orElse(Map.<String, Object>of("success", false, "message", "User not found"));
    }

}