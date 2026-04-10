package com.finfamplan.backend.controller;

import com.finfamplan.backend.model.FamilyGroup;
import com.finfamplan.backend.model.Transaction;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.FinancialProfileRepository;
import com.finfamplan.backend.repository.FamilyGroupRepository;
import com.finfamplan.backend.repository.TransactionRepository;
import com.finfamplan.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/family")
public class FamilyInviteController {

    private final UserRepository userRepository;
    private final FamilyGroupRepository familyGroupRepository;
    private final FinancialProfileRepository fpRepo;
    private final TransactionRepository txRepo;
    private final JdbcTemplate jdbc;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public FamilyInviteController(UserRepository userRepository,
                                  FamilyGroupRepository familyGroupRepository,
                                  FinancialProfileRepository fpRepo,
                                  TransactionRepository txRepo,
                                  JdbcTemplate jdbc) {
        this.userRepository = userRepository;
        this.familyGroupRepository = familyGroupRepository;
        this.fpRepo = fpRepo;
        this.txRepo = txRepo;
        this.jdbc = jdbc;
    }

    @PostMapping("/invite-code/generate")
    public Map<String, Object> generateCode(@RequestBody Map<String, Object> body) {
        if (body.get("userId") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
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

    @PostMapping("/invite-code/join")
    public Map<String, Object> joinWithCode(@RequestBody Map<String, Object> body) {
        if (body.get("userId") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        if (body.get("code") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "code is required");
        Long userId = Long.valueOf(body.get("userId").toString());
        String code = body.get("code").toString().trim().toUpperCase();
        String roleStr = body.getOrDefault("role", "CHILD").toString().toUpperCase();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

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

        try {
            com.finfamplan.backend.model.Role role = com.finfamplan.backend.model.Role.valueOf(roleStr);
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            user.setRole(com.finfamplan.backend.model.Role.CHILD);
        }

        user.setFamilyGroup(group);
        userRepository.save(user);

        jdbc.update("UPDATE family_invite_codes SET used = TRUE WHERE id = ?", codeId);

        return Map.of(
                "success", true,
                "message", "You've joined the family group successfully!"
        );
    }

    @PostMapping("/create-group")
    public Map<String, Object> createGroup(@RequestBody Map<String, Object> body) {
        if (body.get("userId") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        Long userId = Long.valueOf(body.get("userId").toString());
        String name = body.getOrDefault("name", "My Family").toString().trim();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getFamilyGroup() != null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You already have a family group");

        FamilyGroup group = new FamilyGroup();
        group.setName(name.isEmpty() ? "My Family" : name);
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());
        FamilyGroup saved = familyGroupRepository.save(group);

        user.setFamilyGroup(saved);
        userRepository.save(user);

        return Map.of("id", saved.getId(), "name", saved.getName(), "message", "Family group created!");
    }

    @PostMapping("/transfer")
    public Map<String, Object> transfer(@RequestBody Map<String, Object> body) {
        if (body.get("fromUserId") == null || body.get("toUserId") == null || body.get("amount") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromUserId, toUserId and amount are required");

        Long fromUserId = Long.valueOf(body.get("fromUserId").toString());
        Long toUserId   = Long.valueOf(body.get("toUserId").toString());
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String note = body.get("note") != null ? body.get("note").toString().trim() : null;

        if (amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be > 0");

        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));
        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));

        String role = fromUser.getRole().name();
        if (!role.equals("PARENT") && !role.equals("PARTNER"))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only PARENT or PARTNER can send allowances");

        if (fromUser.getFamilyGroup() == null || toUser.getFamilyGroup() == null
                || !fromUser.getFamilyGroup().getId().equals(toUser.getFamilyGroup().getId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both users must be in the same family group");

        fpRepo.findByUser_UserId(toUserId).ifPresent(fp -> {
            BigDecimal bal = fp.getCurrentBalance() != null ? fp.getCurrentBalance() : BigDecimal.ZERO;
            fp.setCurrentBalance(bal.add(amount));
            fpRepo.save(fp);
        });

        Transaction tx = new Transaction();
        tx.setUser(toUser);
        tx.setType("INCOME");
        tx.setCategory("ALLOWANCE");
        tx.setAmount(amount);
        tx.setDescription(note != null && !note.isEmpty()
                ? note
                : "Allowance from " + fromUser.getFirstName());
        tx.setDate(LocalDate.now());
        txRepo.save(tx);

        return Map.of("success", true,
                "message", "Allowance sent to " + toUser.getFirstName() + " successfully!");
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
            String code = sb.toString();
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM family_invite_codes WHERE code = ?", Integer.class, code
            );
            if (count == null || count == 0) return code;
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate unique code");
    }
}
