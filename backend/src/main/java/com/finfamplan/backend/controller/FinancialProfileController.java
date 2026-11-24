package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.FinancialProfileDto;
import com.finfamplan.backend.dto.ForecastResponseDto;
import com.finfamplan.backend.dto.MultiMonthForecastResponseDto;
import com.finfamplan.backend.model.ExpenseItem;
import com.finfamplan.backend.model.FinancialProfile;
import com.finfamplan.backend.model.Transaction;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.FinancialProfileRepository;
import com.finfamplan.backend.repository.TransactionRepository;
import com.finfamplan.backend.repository.UserRepository;
import com.finfamplan.backend.security.AccessGuard;
import com.finfamplan.backend.service.ForecastService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/api/financial")
public class FinancialProfileController {

    private final FinancialProfileRepository financialRepo;
    private final UserRepository             userRepo;
    private final TransactionRepository      txRepo;
    private final AccessGuard                accessGuard;
    private final ForecastService            forecastService;

    public FinancialProfileController(FinancialProfileRepository f,
                                      UserRepository u,
                                      TransactionRepository t,
                                      AccessGuard accessGuard,
                                      ForecastService forecastService) {
        financialRepo = f; userRepo = u; txRepo = t; this.accessGuard = accessGuard;
        this.forecastService = forecastService;
    }

    /**
     * Stories 1, 2, 5: forecast balance until the next payday, the first
     * at-risk due date (if any), and whether it's below the user's alert
     * threshold.
     */
    @GetMapping("/{userId}/forecast")
    public ForecastResponseDto forecast(@PathVariable Long userId, HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        FinancialProfile profile = financialRepo.findByUser_UserId(userId)
                .orElseGet(() -> createDefault(userId));
        return forecastService.forecastUntilNextPayday(profile);
    }

    /** Story 6: multi-month forecast with a low/high range (default 3 months). */
    @GetMapping("/{userId}/forecast/multi-month")
    public MultiMonthForecastResponseDto multiMonthForecast(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "3") int months,
            HttpServletRequest request
    ) {
        accessGuard.requireSelf(request, userId);
        FinancialProfile profile = financialRepo.findByUser_UserId(userId)
                .orElseGet(() -> createDefault(userId));
        return forecastService.forecastMultiMonth(profile, months);
    }

    @GetMapping("/{userId}")
    public FinancialProfileDto get(@PathVariable Long userId, HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        FinancialProfile profile = financialRepo.findByUser_UserId(userId)
                .orElseGet(() -> createDefault(userId));

        checkPaydayPending(profile);
        if (Boolean.TRUE.equals(profile.getSalaryPendingConfirmation())) {
            financialRepo.save(profile);
        }

        return toDto(profile);
    }

    @PutMapping("/{userId}")
    public FinancialProfileDto upsert(@PathVariable Long userId,
                                      @RequestBody FinancialProfileDto dto,
                                      HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        User user = userRepo.findById(userId).orElseThrow();
        FinancialProfile profile = financialRepo.findByUser_UserId(userId)
                .orElseGet(() -> createDefault(userId));
        profile.setUser(user);

        profile.setMonthlyIncome(dto.monthlyIncome != null ? dto.monthlyIncome : BigDecimal.ZERO);
        profile.setCurrency(dto.currency != null ? dto.currency : "EUR");

        if (!Boolean.TRUE.equals(profile.getBalanceLocked()) && dto.currentBalance != null) {
            profile.setCurrentBalance(dto.currentBalance);
        }

        if (Boolean.TRUE.equals(dto.balanceLocked)) {
            profile.setBalanceLocked(true);
        }

        if (dto.paydayDay != null) {
            profile.setPaydayDay(Math.max(1, Math.min(28, dto.paydayDay)));
        }

        if (dto.alertThreshold != null) {
            profile.setAlertThreshold(dto.alertThreshold);
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

        checkPaydayPending(profile);
        return toDto(financialRepo.save(profile));
    }

    /**
     * POST /api/financial/{userId}/confirm-salary
     * User confirms they received their salary.
     * → Add salary to balance
     * → Deduct all fixed expenses
     * → Record transactions
     * → Mark lastSalaryApplied = today
     * → Clear pending flag
     */
    @PostMapping("/{userId}/confirm-salary")
    public FinancialProfileDto confirmSalary(@PathVariable Long userId, HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        User user = userRepo.findById(userId).orElseThrow();
        FinancialProfile profile = financialRepo.findByUser_UserId(userId).orElseThrow();

        BigDecimal income = profile.getMonthlyIncome() != null ? profile.getMonthlyIncome() : BigDecimal.ZERO;
        BigDecimal expenses = BigDecimal.ZERO;

        if (profile.getExpenses() != null) {
            for (ExpenseItem e : profile.getExpenses()) {
                if (e.getAmount() != null) {
                    expenses = expenses.add(e.getAmount());
                }
            }
        }

        BigDecimal current = profile.getCurrentBalance() != null ? profile.getCurrentBalance() : BigDecimal.ZERO;
        BigDecimal net = income.subtract(expenses);

        profile.setCurrentBalance(current.add(net));
        profile.setLastSalaryApplied(LocalDate.now());
        profile.setSalaryPendingConfirmation(false);
        profile.setLastSalaryDismissedDate(null);

        if (income.compareTo(BigDecimal.ZERO) > 0) {
            try {
                Transaction tx = new Transaction();
                tx.setUser(user);
                tx.setType("INCOME");
                tx.setCategory("SALARY");
                tx.setAmount(income);
                tx.setDescription("Salaire mensuel confirmé");
                tx.setDate(LocalDate.now());
                txRepo.save(tx);
            } catch (Exception ignored) {
            }
        }

        if (expenses.compareTo(BigDecimal.ZERO) > 0) {
            try {
                Transaction tx = new Transaction();
                tx.setUser(user);
                tx.setType("EXPENSE");
                tx.setCategory("FIXED_EXPENSES");
                tx.setAmount(expenses);
                tx.setDescription("Charges fixes mensuelles déduites à la paie");
                tx.setDate(LocalDate.now());
                txRepo.save(tx);
            } catch (Exception ignored) {
            }
        }
        return toDto(financialRepo.save(profile));
    }

    /**
     * POST /api/financial/{userId}/dismiss-salary
     * User says they haven't received salary yet — remind again tomorrow.
     */
    @PostMapping("/{userId}/dismiss-salary")
    public Map<String, Object> dismissSalary(@PathVariable Long userId, HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        FinancialProfile profile = financialRepo.findByUser_UserId(userId).orElseThrow();
        profile.setLastSalaryDismissedDate(LocalDate.now());
        profile.setSalaryPendingConfirmation(false);
        financialRepo.save(profile);
        return Map.of("dismissed", true);
    }

    private void checkPaydayPending(FinancialProfile profile) {
        LocalDate today = LocalDate.now();
        int payday = profile.getPaydayDay() != null ? profile.getPaydayDay() : 1;

        if (today.getDayOfMonth() < payday) {
            profile.setSalaryPendingConfirmation(false);
            profile.setLastSalaryDismissedDate(null);
            return;
        }

        LocalDate lastApplied = profile.getLastSalaryApplied();
        if (lastApplied != null
                && lastApplied.getYear() == today.getYear()
                && lastApplied.getMonth() == today.getMonth()) {
            profile.setSalaryPendingConfirmation(false);
            profile.setLastSalaryDismissedDate(null);
            return;
        }

        LocalDate dismissed = profile.getLastSalaryDismissedDate();

        if (dismissed != null && dismissed.equals(today)) {
            profile.setSalaryPendingConfirmation(false);
            return;
        }

        profile.setSalaryPendingConfirmation(true);
    }

    private FinancialProfile createDefault(Long userId) {
        User user = userRepo.findById(userId).orElseThrow();

        FinancialProfile fp = new FinancialProfile();
        fp.setUser(user);
        fp.setMonthlyIncome(BigDecimal.ZERO);
        fp.setCurrency("EUR");
        fp.setExpenses(new ArrayList<>());
        fp.setCurrentBalance(BigDecimal.ZERO);
        fp.setPaydayDay(1);
        fp.setBalanceLocked(false);
        fp.setSalaryPendingConfirmation(false);
        fp.setLastSalaryDismissedDate(null);
        fp.setAlertThreshold(BigDecimal.ZERO);

        return financialRepo.save(fp);
    }

    private FinancialProfileDto toDto(FinancialProfile p) {
        FinancialProfileDto dto = new FinancialProfileDto();
        dto.monthlyIncome = p.getMonthlyIncome();
        dto.currency = p.getCurrency();
        dto.currentBalance = p.getCurrentBalance();
        dto.paydayDay = p.getPaydayDay();
        dto.lastSalaryApplied = p.getLastSalaryApplied();
        dto.balanceLocked = p.getBalanceLocked();
        dto.salaryPendingConfirmation = p.getSalaryPendingConfirmation();
        dto.lastSalaryDismissedDate = p.getLastSalaryDismissedDate();
        dto.alertThreshold = p.getAlertThreshold();

        dto.expenses = p.getExpenses().stream().map(e -> {
            FinancialProfileDto.ExpenseItemDto ed = new FinancialProfileDto.ExpenseItemDto();
            ed.category = e.getCategory();
            ed.amount = e.getAmount();
            return ed;
        }).toList();

        return dto;
    }
}
