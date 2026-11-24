package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.TransactionsResponseDto;
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
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    /**
     * Story 4: filterable by month ("2026-11") and/or category, with a total
     * per category. Filtering happens in memory over the existing finder
     * methods rather than a new JPQL aggregate — this app's per-user
     * transaction volume is small, and it avoids a second, drifting query.
     */
    @GetMapping("/user/{userId}")
    public TransactionsResponseDto getTransactions(
            @PathVariable Long userId,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String category,
            HttpServletRequest request
    ) {
        accessGuard.requireSelf(request, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        List<Transaction> all = ("PARENT".equals(user.getRole().name()) && user.getFamilyGroup() != null)
                ? transactionRepository.findByUser_FamilyGroup_IdOrderByDateDesc(user.getFamilyGroup().getId())
                : transactionRepository.findByUser_UserIdOrderByDateDesc(userId);

        LocalDate monthStart = null;
        LocalDate monthEnd = null;
        if (month != null && !month.isBlank()) {
            try {
                YearMonth ym = YearMonth.parse(month);
                monthStart = ym.atDay(1);
                monthEnd = ym.atEndOfMonth();
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mois doit être au format AAAA-MM");
            }
        }
        final LocalDate from = monthStart;
        final LocalDate to = monthEnd;

        List<Transaction> filtered = all.stream()
                .filter(t -> from == null || !t.getDate().isBefore(from))
                .filter(t -> to == null || !t.getDate().isAfter(to))
                .filter(t -> category == null || category.isBlank() || category.equalsIgnoreCase(t.getCategory()))
                .toList();

        Map<String, BigDecimal> totalsByCategory = filtered.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        TransactionsResponseDto resp = new TransactionsResponseDto();
        resp.transactions = filtered;
        resp.totalsByCategory = totalsByCategory;
        return resp;
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
