package com.finfamplan.backend.functional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finfamplan.backend.dto.LoginRequest;
import com.finfamplan.backend.model.Role;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GoalFunctionalTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private GoalRepository goalRepository;
    @Autowired private GoalContributionRepository contributionRepository;
    @Autowired private FinancialProfileRepository financialProfileRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private Long userId;
    private String jwtToken;

    @BeforeEach
    void setup() throws Exception {
        contributionRepository.deleteAll();
        goalRepository.deleteAll();
        financialProfileRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User();
        user.setFirstName("Alice");
        user.setLastName("Test");
        user.setEmail("alice@test.com");
        user.setPassword(passwordEncoder.encode("SecurePass1"));
        user.setRole(Role.PARENT);
        user = userRepository.save(user);
        userId = user.getUserId();

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("alice@test.com");
        loginReq.setPassword("SecurePass1");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> body = objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
        jwtToken = (String) body.get("token");
    }

    @Test
    void createGoal_thenAppearsInList() throws Exception {
        Map<String, Object> goalReq = Map.of(
                "title", "Vacances à Paris",
                "targetAmount", new BigDecimal("2000.00")
        );

        mockMvc.perform(post("/api/goals/user/" + userId)
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(goalReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Vacances à Paris"))
                .andExpect(jsonPath("$.currentAmount").value(0));

        mockMvc.perform(get("/api/goals/user/" + userId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Vacances à Paris"));
    }

    @Test
    void createGoal_withoutAuth_returns401() throws Exception {
        Map<String, Object> goalReq = Map.of(
                "title", "Objectif sans auth",
                "targetAmount", new BigDecimal("500.00")
        );

        mockMvc.perform(post("/api/goals/user/" + userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(goalReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createMultipleGoals_allAppearInList() throws Exception {
        for (String title : new String[]{"Voiture", "Maison", "Retraite"}) {
            mockMvc.perform(post("/api/goals/user/" + userId)
                    .header("Authorization", "Bearer " + jwtToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of(
                            "title", title,
                            "targetAmount", new BigDecimal("10000.00")
                    ))))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(get("/api/goals/user/" + userId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void getGoals_emptyListForNewUser() throws Exception {
        mockMvc.perform(get("/api/goals/user/" + userId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
