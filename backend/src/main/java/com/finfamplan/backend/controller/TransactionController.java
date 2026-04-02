package com.finfamplan.backend.controller;

import com.finfamplan.backend.model.Transaction;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.TransactionRepository;
import com.finfamplan.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionController(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    // Get transactions for a user (or all family if PARENT)
    @GetMapping("/user/{userId}")
    public List<Transaction> getTransactions(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // PARENT can see all family transactions; CHILD sees only their own
        if ("PARENT".equals(user.getRole().name()) && user.getFamilyGroup() != null) {
            return transactionRepository.findByUser_FamilyGroup_IdOrderByDateDesc(
                    user.getFamilyGroup().getId()
            );
        }
        return transactionRepository.findByUser_UserIdOrderByDateDesc(userId);
    }

    // Note: userRepository.findById() uses userId (the @Id field) — Spring Data
    // maps findById to the @Id column automatically regardless of field name.

    // Create a transaction
    @PostMapping("/user/{userId}")
    public Transaction createTransaction(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String type = body.getOrDefault("type", "EXPENSE").toString().toUpperCase();
        if (!type.equals("INCOME") && !type.equals("EXPENSE")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type must be INCOME or EXPENSE");
        }

        Object amountObj = body.get("amount");
        if (amountObj == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount is required");
        BigDecimal amount = new BigDecimal(amountObj.toString());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount must be > 0");
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
