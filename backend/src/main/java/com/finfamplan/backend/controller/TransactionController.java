package com.finfamplan.backend.controller;

import com.finfamplan.backend.model.Transaction;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.TransactionRepository;
import com.finfamplan.backend.repository.UserRepository;
import com.finfamplan.backend.security.AccessGuard;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccessGuard accessGuard;

    public TransactionController(TransactionRepository transactionRepository,
                                 UserRepository userRepository,
                                 AccessGuard accessGuard) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.accessGuard = accessGuard;
    }

    @GetMapping("/user/{userId}")
    public List<Transaction> getTransactions(@PathVariable Long userId, HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        if ("PARENT".equals(user.getRole().name()) && user.getFamilyGroup() != null) {
            return transactionRepository.findByUser_FamilyGroup_IdOrderByDateDesc(
                    user.getFamilyGroup().getId()
            );
        }
        return transactionRepository.findByUser_UserIdOrderByDateDesc(userId);
    }


    @PostMapping("/user/{userId}")
    public Transaction createTransaction(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request
    ) {
        accessGuard.requireSelf(request, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        String type = body.getOrDefault("type", "EXPENSE").toString().toUpperCase();
        if (!type.equals("INCOME") && !type.equals("EXPENSE")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le type doit être INCOME ou EXPENSE");
        }

        Object amountObj = body.get("amount");
        if (amountObj == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le montant est requis");
        BigDecimal amount = new BigDecimal(amountObj.toString());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le montant doit être supérieur à 0");
        }

        Transaction t = new Transaction();
        t.setUser(user);
        t.setType(type);
        t.setCategory(body.getOrDefault("category", "OTHER").toString());
        t.setAmount(amount);
        t.setDescription(body.get("description") != null ? body.get("description").toString() : null);

        Object dateObj = body.get("date");
        t.setDate(dateObj != null ? LocalDate.parse(dateObj.toString()) : LocalDate.now());

        return transactionRepository.save(t);
    }
}
