package com.finfamplan.backend.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finfamplan.backend.dto.LoginRequest;
import com.finfamplan.backend.model.FinancialProfile;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserJourneyE2ETest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private GoalRepository goalRepository;
    @Autowired private GoalContributionRepository contributionRepository;
    @Autowired private FinancialProfileRepository financialProfileRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @BeforeEach
    void clean() {
        contributionRepository.deleteAll();
        goalRepository.deleteAll();
        financialProfileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void journey_register_login_createGoal_contribute_balanceDecreased() throws Exception {

        // 1. Register
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "firstName", "Alice",
                        "lastName",  "Dupont",
                        "email",     "alice@journey.com",
                        "password",  "SecurePass1",
                        "role",      "PARENT"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 2. Login → get JWT + userId
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("alice@journey.com");
        loginReq.setPassword("SecurePass1");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        Map<?, ?> loginBody = objectMapper.readValue(loginResult.getResponse().getContentAsString(), Map.class);
        String token  = (String) loginBody.get("token");
        Long userId   = ((Number) ((Map<?, ?>) loginBody.get("user")).get("id")).longValue();

        // 3. Create financial profile with 1 000 € balance (directly via repo — realistic pre-condition)
        User user = userRepository.findById(userId).orElseThrow();
        FinancialProfile fp = new FinancialProfile();
        fp.setUser(user);
        fp.setMonthlyIncome(BigDecimal.valueOf(3000));
        fp.setCurrency("EUR");
        fp.setCurrentBalance(BigDecimal.valueOf(1000));
        fp.setPaydayDay(1);
        fp.setBalanceLocked(false);
        fp.setSalaryPendingConfirmation(false);
        financialProfileRepository.save(fp);

        // 4. Create a goal
        MvcResult goalResult = mockMvc.perform(post("/api/goals/user/" + userId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "title",        "Fonds d'urgence",
                        "targetAmount", new BigDecimal("500.00")
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Fonds d'urgence"))
                .andExpect(jsonPath("$.currentAmount").value(0))
                .andReturn();

        Map<?, ?> goalBody = objectMapper.readValue(goalResult.getResponse().getContentAsString(), Map.class);
        Long goalId = ((Number) goalBody.get("id")).longValue();

        // 5. Contribute 200 €
        mockMvc.perform(post("/api/goals/" + goalId + "/contribute/user/" + userId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("amount", new BigDecimal("200.00")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentAmount").value(200.0));

        // 6. Assert balance decreased from 1000 to 800
        FinancialProfile updated = financialProfileRepository.findByUser_UserId(userId).orElseThrow();
        assertEquals(0, updated.getCurrentBalance().compareTo(BigDecimal.valueOf(800)),
                "Balance should be 800 after contributing 200 from 1000");
    }

    @Test
    void journey_contributeMoreThanBalance_isRejected() throws Exception {

        // Register + login
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "firstName", "Bob",
                        "lastName",  "Martin",
                        "email",     "bob@journey.com",
                        "password",  "SecurePass1",
                        "role",      "PARENT"
                ))))
                .andExpect(status().isOk());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("bob@journey.com");
        loginReq.setPassword("SecurePass1");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andReturn();

        Map<?, ?> loginBody = objectMapper.readValue(loginResult.getResponse().getContentAsString(), Map.class);
        String token = (String) loginBody.get("token");
        Long userId  = ((Number) ((Map<?, ?>) loginBody.get("user")).get("id")).longValue();

        // Financial profile with only 50 €
        User user = userRepository.findById(userId).orElseThrow();
        FinancialProfile fp = new FinancialProfile();
        fp.setUser(user);
        fp.setMonthlyIncome(BigDecimal.valueOf(1500));
        fp.setCurrency("EUR");
        fp.setCurrentBalance(BigDecimal.valueOf(50));
        fp.setPaydayDay(1);
        fp.setBalanceLocked(false);
        fp.setSalaryPendingConfirmation(false);
        financialProfileRepository.save(fp);

        // Create goal
        MvcResult goalResult = mockMvc.perform(post("/api/goals/user/" + userId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "title",        "Objectif ambitieux",
                        "targetAmount", new BigDecimal("1000.00")
                ))))
                .andReturn();

        Long goalId = ((Number) objectMapper.readValue(
                goalResult.getResponse().getContentAsString(), Map.class).get("id")).longValue();

        // Try to contribute 500 € with only 50 € balance → expect 400
        mockMvc.perform(post("/api/goals/" + goalId + "/contribute/user/" + userId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("amount", new BigDecimal("500.00")))))
                .andExpect(status().isBadRequest());
    }
}
