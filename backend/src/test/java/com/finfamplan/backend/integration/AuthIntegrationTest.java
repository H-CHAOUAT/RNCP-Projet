package com.finfamplan.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finfamplan.backend.dto.LoginRequest;
import com.finfamplan.backend.dto.RegisterRequest;
import com.finfamplan.backend.model.Role;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.FinancialProfileRepository;
import com.finfamplan.backend.repository.GoalContributionRepository;
import com.finfamplan.backend.repository.GoalRepository;
import com.finfamplan.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private FinancialProfileRepository financialProfileRepository;
    @Autowired private GoalContributionRepository goalContributionRepository;
    @Autowired private GoalRepository goalRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        goalContributionRepository.deleteAll();
        goalRepository.deleteAll();
        financialProfileRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User();
        user.setFirstName("Alice");
        user.setLastName("Test");
        user.setEmail("alice@example.com");
        user.setPassword(passwordEncoder.encode("SecurePass1"));
        user.setRole(Role.PARENT);
        userRepository.save(user);
    }

    @Test
    void login_success_returnsTokenAndUser() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("SecurePass1");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("alice@example.com"))
                .andExpect(jsonPath("$.user.role").value("PARENT"));
    }

    @Test
    void login_wrongPassword_returnsInvalidCredentials() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@example.com");
        req.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void login_unknownEmail_returnsInvalidCredentials() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("nobody@example.com");
        req.setPassword("any");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void register_success_thenLoginWorks() throws Exception {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFirstName("Bob");
        registerReq.setLastName("Martin");
        registerReq.setEmail("bob@example.com");
        registerReq.setPassword("SecurePass1");
        registerReq.setRole("PARENT");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("bob@example.com");
        loginReq.setPassword("SecurePass1");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void register_duplicateEmail_fails() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("Alice");
        req.setLastName("Dupont");
        req.setEmail("alice@example.com");
        req.setPassword("SecurePass1");
        req.setRole("PARENT");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email already exists"));
    }
}
