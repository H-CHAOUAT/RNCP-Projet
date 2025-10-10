package com.finfamplan.backend.service;


import com.finfamplan.backend.dto.LoginRequest;
import com.finfamplan.backend.dto.RegisterRequest;
import com.finfamplan.backend.dto.UserDto;
import com.finfamplan.backend.dto.AuthResponse;
import com.finfamplan.backend.model.Role;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    @Transactional
    public UserDto register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // ✅ convert String to Role enum safely
        Role role = toRole(req.getRole());

        User u = new User();
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setEmail(req.getEmail());
        u.setRole(role);
        u.setPassword(passwordEncoder.encode(req.getPassword())); // hash password

        User saved = userRepository.save(u);

        return UserDto.builder()
                .userId(saved.getUserId())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .email(saved.getEmail())
                .role(saved.getRole().name()) // return as string if UserDto expects String
                .salary(saved.getSalary())
                .balance(saved.getBalance())
                .build();
    }

    public AuthResponse login(LoginRequest req) {
        User u = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean ok = passwordEncoder.matches(req.getPassword(), u.getPassword());
        if (!ok) {
            return AuthResponse.builder()
                    .status("ERROR")
                    .message("Bad credentials")
                    .build();
        }
        // ✅ generate JWT
        String token = jwtService.generateToken(u);

        return AuthResponse.builder()
                .status("OK")
                .message("Logged in successfully")
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(900) // 15 minutes (match JwtService)
                .build();
    }

    // helper: String -> Role enum
    private Role toRole(String raw) {
        try {
            return Role.valueOf(raw.trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException(
                    "Invalid role. Allowed: PARENT, PARTNER, CHILD, ADMIN"
            );
        }
    }
}
