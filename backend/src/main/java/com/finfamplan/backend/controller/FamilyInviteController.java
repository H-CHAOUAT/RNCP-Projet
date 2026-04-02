package com.finfamplan.backend.controller;

import com.finfamplan.backend.model.FamilyGroup;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.FamilyGroupRepository;
import com.finfamplan.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.Map;

@RestController
@RequestMapping("/api/family")
@CrossOrigin(origins = "*")
public class FamilyInviteController {

    private final UserRepository userRepository;
    private final FamilyGroupRepository familyGroupRepository;
    private final JdbcTemplate jdbc;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
    private static final SecureRandom RANDOM = new SecureRandom();

    public FamilyInviteController(UserRepository userRepository,
                                  FamilyGroupRepository familyGroupRepository,
                                  JdbcTemplate jdbc) {
        this.userRepository = userRepository;
        this.familyGroupRepository = familyGroupRepository;
        this.jdbc = jdbc;
    }

    // Generate a new invite code for the caller's family group
    @PostMapping("/invite-code/generate")
    public Map<String, Object> generateCode(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getFamilyGroup() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "You are not part of a family group yet. Create one first.");
        }

        String code = generateUniqueCode();
        Long familyGroupId = user.getFamilyGroup().getId();

        jdbc.update(
                "INSERT INTO family_invite_codes (code, family_group_id, created_by) VALUES (?, ?, ?)",
                code, familyGroupId, userId
        );

        return Map.of(
                "code", code,
                "message", "Share this code with your family member. It can be used once."
        );
    }

    // Join a family group using a code
    @PostMapping("/invite-code/join")
    public Map<String, Object> joinWithCode(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String code = body.get("code").toString().trim().toUpperCase();
        String roleStr = body.getOrDefault("role", "CHILD").toString().toUpperCase();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Look up the code
        var rows = jdbc.queryForList(
                "SELECT id, family_group_id, used FROM family_invite_codes WHERE code = ?", code
        );

        if (rows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid code. Check it and try again.");
        }

        Map<String, Object> row = rows.get(0);
        boolean used = (Boolean) row.get("used");

        if (used) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This code has already been used. Ask your family to generate a new one.");
        }

        Long familyGroupId = ((Number) row.get("family_group_id")).longValue();
        Long codeId = ((Number) row.get("id")).longValue();

        FamilyGroup group = familyGroupRepository.findById(familyGroupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Family group not found"));

        // Set role
        try {
            com.finfamplan.backend.model.Role role = com.finfamplan.backend.model.Role.valueOf(roleStr);
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            user.setRole(com.finfamplan.backend.model.Role.CHILD);
        }

        user.setFamilyGroup(group);
        userRepository.save(user);

        // Mark code as used
        jdbc.update("UPDATE family_invite_codes SET used = TRUE WHERE id = ?", codeId);

        return Map.of(
                "success", true,
                "message", "You've joined the family group successfully!"
        );
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
            String code = sb.toString();
            // Check uniqueness
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM family_invite_codes WHERE code = ?", Integer.class, code
            );
            if (count == null || count == 0) return code;
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate unique code");
    }
}
