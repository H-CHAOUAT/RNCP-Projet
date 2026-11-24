package com.finfamplan.backend.controller;

import com.finfamplan.backend.model.FamilyGroup;
import com.finfamplan.backend.model.Transaction;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.FinancialProfileRepository;
import com.finfamplan.backend.repository.FamilyGroupRepository;
import com.finfamplan.backend.repository.TransactionRepository;
import com.finfamplan.backend.repository.UserRepository;
import com.finfamplan.backend.model.FinancialProfile;
import com.finfamplan.backend.security.AccessGuard;
import jakarta.servlet.http.HttpServletRequest;
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
    private final AccessGuard accessGuard;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public FamilyInviteController(UserRepository userRepository,
                                  FamilyGroupRepository familyGroupRepository,
                                  FinancialProfileRepository fpRepo,
                                  TransactionRepository txRepo,
                                  JdbcTemplate jdbc,
                                  AccessGuard accessGuard) {
        this.userRepository = userRepository;
        this.familyGroupRepository = familyGroupRepository;
        this.fpRepo = fpRepo;
        this.txRepo = txRepo;
        this.jdbc = jdbc;
        this.accessGuard = accessGuard;
    }

    @PostMapping("/invite-code/generate")
    public Map<String, Object> generateCode(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        if (body.get("userId") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId est requis");
        Long userId = Long.valueOf(body.get("userId").toString());
        accessGuard.requireSelf(request, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        if (user.getFamilyGroup() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Vous n'appartenez à aucun foyer pour l'instant. Créez-en un d'abord.");
        }

        String code = generateUniqueCode();
        Long familyGroupId = user.getFamilyGroup().getId();

        jdbc.update(
                "INSERT INTO family_invite_codes (code, family_group_id, created_by) VALUES (?, ?, ?)",
                code, familyGroupId, userId
        );

        return Map.of(
                "code", code,
                "message", "Partagez ce code avec un membre de votre foyer. Il n'est valable qu'une seule fois."
        );
    }

    @PostMapping("/invite-code/join")
    public Map<String, Object> joinWithCode(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        if (body.get("userId") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId est requis");
        if (body.get("code") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le code est requis");
        Long userId = Long.valueOf(body.get("userId").toString());
        accessGuard.requireSelf(request, userId);
        String code = body.get("code").toString().trim().toUpperCase();
        String roleStr = body.getOrDefault("role", "CHILD").toString().toUpperCase();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        var rows = jdbc.queryForList(
                "SELECT id, family_group_id, used FROM family_invite_codes WHERE code = ?", code
        );

        if (rows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Code invalide. Vérifiez-le et réessayez.");
        }

        Map<String, Object> row = rows.get(0);
        boolean used = (Boolean) row.get("used");

        if (used) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ce code a déjà été utilisé. Demandez à votre foyer d'en générer un nouveau.");
        }

        Long familyGroupId = ((Number) row.get("family_group_id")).longValue();
        Long codeId = ((Number) row.get("id")).longValue();

        FamilyGroup group = familyGroupRepository.findById(familyGroupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Foyer introuvable"));

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
                "message", "Vous avez rejoint le foyer avec succès !"
        );
    }

    @PostMapping("/create-group")
    public Map<String, Object> createGroup(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        if (body.get("userId") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId est requis");
        Long userId = Long.valueOf(body.get("userId").toString());
        accessGuard.requireSelf(request, userId);
        String name = body.getOrDefault("name", "Ma famille").toString().trim();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        if (user.getFamilyGroup() != null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous avez déjà un foyer");

        FamilyGroup group = new FamilyGroup();
        group.setName(name.isEmpty() ? "Ma famille" : name);
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());
        FamilyGroup saved = familyGroupRepository.save(group);

        user.setFamilyGroup(saved);
        userRepository.save(user);

        return Map.of("id", saved.getId(), "name", saved.getName(), "message", "Foyer créé !");
    }

    @PostMapping("/transfer")
    public Map<String, Object> transfer(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        if (body.get("fromUserId") == null || body.get("toUserId") == null || body.get("amount") == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromUserId, toUserId et amount sont requis");

        Long fromUserId = Long.valueOf(body.get("fromUserId").toString());
        Long toUserId   = Long.valueOf(body.get("toUserId").toString());
        accessGuard.requireSelf(request, fromUserId);
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String note = body.get("note") != null ? body.get("note").toString().trim() : null;

        if (amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le montant doit être supérieur à 0");

        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expéditeur introuvable"));
        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destinataire introuvable"));

        String role = fromUser.getRole().name();
        if (!role.equals("PARENT"))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul un parent peut envoyer de l'argent de poche");

        if (fromUser.getFamilyGroup() == null || toUser.getFamilyGroup() == null
                || !fromUser.getFamilyGroup().getId().equals(toUser.getFamilyGroup().getId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les deux utilisateurs doivent appartenir au même foyer");

        FinancialProfile fromFp = fpRepo.findByUser_UserId(fromUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'expéditeur n'a pas de profil financier"));
        BigDecimal fromBalance = fromFp.getCurrentBalance() != null ? fromFp.getCurrentBalance() : BigDecimal.ZERO;
        if (fromBalance.compareTo(amount) < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solde insuffisant");

        fromFp.setCurrentBalance(fromBalance.subtract(amount));
        fpRepo.save(fromFp);

        fpRepo.findByUser_UserId(toUserId).ifPresent(fp -> {
            BigDecimal bal = fp.getCurrentBalance() != null ? fp.getCurrentBalance() : BigDecimal.ZERO;
            fp.setCurrentBalance(bal.add(amount));
            fpRepo.save(fp);
        });

        String description = note != null && !note.isEmpty() ? note : "Argent de poche";

        Transaction debit = new Transaction();
        debit.setUser(fromUser);
        debit.setType("EXPENSE");
        debit.setCategory("ALLOWANCE");
        debit.setAmount(amount);
        debit.setDescription(description + " pour " + toUser.getFirstName());
        debit.setDate(LocalDate.now());
        txRepo.save(debit);

        Transaction credit = new Transaction();
        credit.setUser(toUser);
        credit.setType("INCOME");
        credit.setCategory("ALLOWANCE");
        credit.setAmount(amount);
        credit.setDescription(note != null && !note.isEmpty()
                ? note
                : "Argent de poche de " + fromUser.getFirstName());
        credit.setDate(LocalDate.now());
        txRepo.save(credit);

        return Map.of("success", true,
                "message", "Argent de poche envoyé à " + toUser.getFirstName() + " avec succès !");
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
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossible de générer un code unique");
    }
}
