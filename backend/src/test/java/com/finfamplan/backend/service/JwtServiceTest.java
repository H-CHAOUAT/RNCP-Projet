package com.finfamplan.backend.service;

import com.finfamplan.backend.model.Role;
import com.finfamplan.backend.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    private static final String TEST_SECRET =
            "RmluRmFtUGxhbkp3dFNlY3JldEtleUZvckRldmVsb3BtZW50T25seVJlcGxhY2VJblByb2R1Y3Rpb24=";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
    }

    private User makeUser(String email) {
        User u = new User();
        u.setUserId(1L);
        u.setEmail(email);
        u.setPassword("hashed");
        u.setRole(Role.PARENT);
        return u;
    }

    @Test
    void generateToken_isNotBlank() {
        String token = jwtService.generateToken(makeUser("alice@test.com"));
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void generateToken_hasThreeParts() {
        String token = jwtService.generateToken(makeUser("alice@test.com"));
        assertEquals(3, token.split("\\.").length, "JWT must have header.payload.signature");
    }

    @Test
    void extractUsername_returnsEmail() {
        User user = makeUser("alice@test.com");
        String token = jwtService.generateToken(user);
        assertEquals("alice@test.com", jwtService.extractUsername(token));
    }

    @Test
    void isTokenValid_trueForSameUser() {
        User user = makeUser("alice@test.com");
        String token = jwtService.generateToken(user);
        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void isTokenValid_falseForDifferentUser() {
        User alice = makeUser("alice@test.com");
        User bob   = makeUser("bob@test.com");
        String token = jwtService.generateToken(alice);
        assertFalse(jwtService.isTokenValid(token, bob));
    }
}
