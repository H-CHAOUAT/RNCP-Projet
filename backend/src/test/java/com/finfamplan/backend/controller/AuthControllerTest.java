package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.LoginRequest;
import com.finfamplan.backend.dto.RegisterRequest;
import com.finfamplan.backend.model.Role;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder encoder;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterNewUserSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john@example.com");
        request.setPassword("1234");
        request.setRole("ADMIN");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(encoder.encode("1234")).thenReturn("encoded1234");

        Map<String, Object> response = authController.register(request);

        assertTrue((Boolean) response.get("success"));
        assertEquals("User registered successfully", response.get("message"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterExistingUserFails() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("admin@example.com");

        when(userRepository.existsByEmail("admin@example.com")).thenReturn(true);

        Map<String, Object> response = authController.register(request);

        assertFalse((Boolean) response.get("success"));
        assertEquals("Email already exists", response.get("message"));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@example.com");
        request.setPassword("password123");

        User user = new User();
        user.setUserId(1L);
        user.setEmail("admin@example.com");
        user.setPassword("encodedpass");
        user.setRole(Role.ADMIN);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches(eq("password123"), eq("encodedpass"))).thenReturn(true);

        Map<String, Object> response = authController.login(request);

        assertTrue((Boolean) response.get("success"));
        assertEquals("Login successful", response.get("message"));
        assertNotNull(((Map<?, ?>) response.get("user")).get("email"));
    }

    @Test
    void testLoginInvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@example.com");
        request.setPassword("wrong");

        User user = new User();
        user.setEmail("admin@example.com");
        user.setPassword("encoded");
        user.setRole(Role.ADMIN);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches("wrong", "encoded")).thenReturn(false);

        Map<String, Object> response = authController.login(request);

        assertFalse((Boolean) response.get("success"));
        assertEquals("Invalid password", response.get("message"));
    }
}
