package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.FinancialProfileDto;
import com.finfamplan.backend.model.ExpenseItem;
import com.finfamplan.backend.model.FinancialProfile;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.FinancialProfileRepository;
import com.finfamplan.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
                    return financialRepo.save(fp);
                });

        return toDto(profile);
    }

    @PutMapping("/{userId}")
    public FinancialProfileDto upsert(@PathVariable Long userId, @RequestBody FinancialProfileDto dto) {
        User user = userRepo.findById(userId).orElseThrow();

        FinancialProfile profile = financialRepo.findByUser_UserId(userId)
                .orElseGet(() -> {
                    FinancialProfile fp = new FinancialProfile();
                    fp.setUser(user);
                    return fp;
                });

        profile.setMonthlyIncome(dto.monthlyIncome != null ? dto.monthlyIncome : BigDecimal.ZERO);
        profile.setCurrency(dto.currency != null ? dto.currency : "EUR");

        if (profile.getExpenses() == null) { profile.setExpenses(new ArrayList<>()); }

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

        FinancialProfile saved = financialRepo.save(profile);
        return toDto(saved);
    }

    private FinancialProfileDto toDto(FinancialProfile profile) {
        FinancialProfileDto dto = new FinancialProfileDto();
        dto.monthlyIncome = profile.getMonthlyIncome();
        dto.currency = profile.getCurrency();
        dto.expenses = profile.getExpenses().stream().map(e -> {
            FinancialProfileDto.ExpenseItemDto ed = new FinancialProfileDto.ExpenseItemDto();
            ed.category = e.getCategory();
            ed.amount = e.getAmount();
            return ed;
        }).toList();
        return dto;
    }
}
