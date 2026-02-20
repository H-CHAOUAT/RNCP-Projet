package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.FinancialProfileDto;
import com.finfamplan.backend.model.ExpenseItem;
import com.finfamplan.backend.model.FinancialProfile;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.FinancialProfileRepository;
import com.finfamplan.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "http://localhost:3000")
public class FinancialProfileController {

    private final FinancialProfileRepository financialRepo;
    private final UserRepository userRepo;

    public FinancialProfileController(FinancialProfileRepository financialRepo, UserRepository userRepo) {
        this.financialRepo = financialRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/{userId}")
    public FinancialProfileDto get(@PathVariable Long userId) {
        FinancialProfile profile = financialRepo.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepo.findById(userId).orElseThrow();
                    FinancialProfile fp = new FinancialProfile();
                    fp.setUser(user);
                    fp.setMonthlyIncome(BigDecimal.ZERO);
                    fp.setCurrency("EUR");
                    fp.setExpenses(new ArrayList<>());

                    fp.setCurrentBalance(BigDecimal.ZERO);
                    fp.setPaydayDay(1);
                    fp.setLastSalaryApplied(null);

                    return financialRepo.save(fp);
                });

        boolean changed = applyMonthlyUpdateIfDue(profile);
        if (changed) profile = financialRepo.save(profile);

        return toDto(profile);
    }

    @PutMapping("/{userId}")
    public FinancialProfileDto upsert(@PathVariable Long userId, @RequestBody FinancialProfileDto dto) {
        User user = userRepo.findById(userId).orElseThrow();

        FinancialProfile profile = financialRepo.findByUser_UserId(userId)
                .orElseGet(() -> {
                    FinancialProfile fp = new FinancialProfile();
                    fp.setUser(user);
                    fp.setExpenses(new ArrayList<>());
                    fp.setMonthlyIncome(BigDecimal.ZERO);
                    fp.setCurrency("EUR");
                    fp.setCurrentBalance(BigDecimal.ZERO);
                    fp.setPaydayDay(1);
                    fp.setLastSalaryApplied(null);
                    return fp;
                });

        profile.setMonthlyIncome(dto.monthlyIncome != null ? dto.monthlyIncome : BigDecimal.ZERO);
        profile.setCurrency(dto.currency != null ? dto.currency : "EUR");

        if (dto.currentBalance != null) {
            profile.setCurrentBalance(dto.currentBalance);
        }

        if (dto.paydayDay != null) {
            int pd = Math.max(1, Math.min(28, dto.paydayDay));
            profile.setPaydayDay(pd);
        }

        if (profile.getExpenses() == null) profile.setExpenses(new ArrayList<>());
        profile.getExpenses().clear();

        if (dto.expenses != null) {
            for (FinancialProfileDto.ExpenseItemDto e : dto.expenses) {
                ExpenseItem item = new ExpenseItem();
                item.setFinancialProfile(profile);
                item.setCategory(e.category != null ? e.category : "OTHER");
                item.setAmount(e.amount != null ? e.amount : BigDecimal.ZERO);
                profile.getExpenses().add(item);
            }
        }

        // apply monthly salary + fixed expenses if due
        applyMonthlyUpdateIfDue(profile);

        FinancialProfile saved = financialRepo.save(profile);
        return toDto(saved);
    }

    /**
     * Applies salary once per month on paydayDay and subtracts fixed expenses once as well.
     * Returns true if something changed.
     */
    private boolean applyMonthlyUpdateIfDue(FinancialProfile profile) {
        LocalDate today = LocalDate.now();
        int payday = profile.getPaydayDay() != null ? profile.getPaydayDay() : 1;

        // Avoid invalid dates: we clamp to 28 already, so safe.
        LocalDate thisMonthPayday = LocalDate.of(today.getYear(), today.getMonth(), payday);

        // If today is before payday, do nothing
        if (today.isBefore(thisMonthPayday)) return false;

        // If already applied this month, do nothing
        LocalDate last = profile.getLastSalaryApplied();
        if (last != null && last.getYear() == today.getYear() && last.getMonth() == today.getMonth()) {
            return false;
        }

        BigDecimal income = profile.getMonthlyIncome() != null ? profile.getMonthlyIncome() : BigDecimal.ZERO;

        BigDecimal expensesTotal = BigDecimal.ZERO;
        if (profile.getExpenses() != null) {
            for (ExpenseItem e : profile.getExpenses()) {
                if (e.getAmount() != null) expensesTotal = expensesTotal.add(e.getAmount());
            }
        }

        BigDecimal current = profile.getCurrentBalance() != null ? profile.getCurrentBalance() : BigDecimal.ZERO;

        // Apply: currentBalance = currentBalance + income - fixedExpenses
        profile.setCurrentBalance(current.add(income).subtract(expensesTotal));
        profile.setLastSalaryApplied(thisMonthPayday);

        return true;
    }

    private FinancialProfileDto toDto(FinancialProfile profile) {
        FinancialProfileDto dto = new FinancialProfileDto();
        dto.monthlyIncome = profile.getMonthlyIncome();
        dto.currency = profile.getCurrency();

        dto.currentBalance = profile.getCurrentBalance();
        dto.paydayDay = profile.getPaydayDay();
        dto.lastSalaryApplied = profile.getLastSalaryApplied();

        dto.expenses = profile.getExpenses().stream().map(e -> {
            FinancialProfileDto.ExpenseItemDto ed = new FinancialProfileDto.ExpenseItemDto();
            ed.category = e.getCategory();
            ed.amount = e.getAmount();
            return ed;
        }).toList();

        return dto;
    }
}
