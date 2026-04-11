package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.LoginRequest;
import com.finfamplan.backend.dto.RegisterRequest;
import com.finfamplan.backend.model.Role;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.UserRepository;
import com.finfamplan.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder encoder;
    @Mock private JwtService jwtService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("Alice");
        req.setLastName("Dupont");
        req.setEmail("alice@example.com");
        req.setPassword("SecurePass1");
        req.setRole("PARENT");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(encoder.encode("SecurePass1")).thenReturn("hashed");

        Map<String, Object> res = authController.register(req);

        assertTrue((Boolean) res.get("success"));
        assertEquals("User registered successfully", res.get("message"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_emailAlreadyExists_fails() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@example.com");
        req.setPassword("SecurePass1");
        req.setRole("PARENT");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        Map<String, Object> res = authController.register(req);

        assertFalse((Boolean) res.get("success"));
        assertEquals("Email already exists", res.get("message"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_passwordTooShort_fails() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("alice@example.com");
        req.setPassword("short");
        req.setRole("PARENT");

        Map<String, Object> res = authController.register(req);

        assertFalse((Boolean) res.get("success"));
        assertEquals("Password must be at least 8 characters", res.get("message"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_success_returnsTokenAndUser() {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("SecurePass1");

        User user = new User();
        user.setUserId(1L);
        user.setEmail("alice@example.com");
        user.setPassword("hashed");
        user.setRole(Role.PARENT);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches("SecurePass1", "hashed")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("jwt.token.value");

        Map<String, Object> res = authController.login(req);

        assertTrue((Boolean) res.get("success"));
        assertEquals("jwt.token.value", res.get("token"));
        assertNotNull(res.get("user"));
        assertEquals("alice@example.com", ((Map<?, ?>) res.get("user")).get("email"));
    }

    @Test
    void login_wrongPassword_returnsInvalidCredentials() {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("wrong");

        User user = new User();
        user.setEmail("alice@example.com");
        user.setPassword("hashed");
        user.setRole(Role.PARENT);

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches("wrong", "hashed")).thenReturn(false);

        Map<String, Object> res = authController.login(req);

        assertFalse((Boolean) res.get("success"));
        assertEquals("Invalid credentials", res.get("message"));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void login_unknownEmail_returnsInvalidCredentials() {
        LoginRequest req = new LoginRequest();
        req.setEmail("nobody@example.com");
        req.setPassword("any");

        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        Map<String, Object> res = authController.login(req);

        assertFalse((Boolean) res.get("success"));
        assertEquals("Invalid credentials", res.get("message"));
    }
}
