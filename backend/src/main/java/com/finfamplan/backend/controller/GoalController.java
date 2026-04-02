package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.*;
import com.finfamplan.backend.model.*;
import com.finfamplan.backend.repository.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:3000")
public class GoalController {

    private final GoalRepository goalRepo;
    private final GoalContributionRepository contribRepo;
    private final UserRepository userRepo;
    private final FinancialProfileRepository financialRepo;

    public GoalController(
            GoalRepository goalRepo,
            GoalContributionRepository contribRepo,
            UserRepository userRepo,
            FinancialProfileRepository financialRepo
    ) {
        this.goalRepo = goalRepo;
        this.contribRepo = contribRepo;
        this.userRepo = userRepo;
        this.financialRepo = financialRepo;
    }

    @GetMapping("/user/{userId}")
    public List<GoalViewDto> list(@PathVariable Long userId) {
        return goalRepo.findByUser_UserId(userId)
                .stream()
                .map(this::toViewDto)
                .toList();
    }

    @PostMapping("/user/{userId}")
    public GoalViewDto create(@PathVariable Long userId, @RequestBody @Valid CreateGoalRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Goal g = new Goal();
        g.setUser(user);

        g.setTitle(req.title);
        g.setDescription(req.description);
        g.setDeadline(req.deadline);

        g.setTargetAmount(req.targetAmount);
        g.setCurrentAmount(BigDecimal.ZERO);

        // creator
        g.setCreatedBy(user);

        Goal saved = goalRepo.save(g);
        return toViewDto(saved);
    }

    @PostMapping("/{goalId}/contribute/user/{userId}")
    @Transactional
    public GoalViewDto contribute(
            @PathVariable Long goalId,
            @PathVariable Long userId,
            @RequestBody @Valid ContributeRequest req
    ) {
        if (req.amount == null || req.amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be > 0");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Goal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));

        if (!goal.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your goal");
        }

        FinancialProfile fp = financialRepo.findByUser_UserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Financial profile missing"));

        BigDecimal current = fp.getCurrentBalance() != null ? fp.getCurrentBalance() : BigDecimal.ZERO;

        if (current.compareTo(req.amount) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient balance");
        }

        fp.setCurrentBalance(current.subtract(req.amount));
        financialRepo.save(fp);

        BigDecimal goalCurrent = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : BigDecimal.ZERO;
        goal.setCurrentAmount(goalCurrent.add(req.amount));
        goalRepo.save(goal);

        GoalContribution c = new GoalContribution();
        c.setGoal(goal);
        c.setUser(user);
        c.setAmount(req.amount);
        contribRepo.save(c);

        return toViewDto(goal);
    }

        @GetMapping("/{goalId}/suggestions/user/{userId}")
    public GoalSuggestionsResponseDto suggestions(@PathVariable Long goalId, @PathVariable Long userId) {

        Goal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));

        if (!goal.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your goal");
        }

        if (goal.getDeadline() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Goal deadline is required for suggestions");
        }

        FinancialProfile fp = financialRepo.findByUser_UserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Financial profile missing"));

        String currency = fp.getCurrency() != null ? fp.getCurrency() : "EUR";
        int paydayDay = fp.getPaydayDay() != null ? fp.getPaydayDay() : 1;
        paydayDay = Math.max(1, Math.min(28, paydayDay));

        BigDecimal target = nz(goal.getTargetAmount());
        BigDecimal current = nz(goal.getCurrentAmount());
        BigDecimal remaining = target.subtract(current);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;

        LocalDate today = LocalDate.now();
        LocalDate deadline = goal.getDeadline();

        if (deadline.isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deadline is in the past");
        }

        LocalDate nextPayday = computeNextPayday(today, paydayDay);
        int paydaysToDeadline = countPaydaysInclusive(nextPayday, deadline, paydayDay);

        if (paydaysToDeadline <= 0) paydaysToDeadline = 1;

        BigDecimal base = remaining
                .divide(BigDecimal.valueOf(paydaysToDeadline), 2, RoundingMode.CEILING);

        GoalSuggestionDto onTime = new GoalSuggestionDto();
        onTime.label = "On time";
        onTime.amountPerPayday = base;
        onTime.paydaysToDeadline = paydaysToDeadline;
        onTime.note = "Recommended amount each payday to reach the deadline.";

        GoalSuggestionDto aggressive = new GoalSuggestionDto();
        aggressive.label = "Aggressive (+20%)";
        aggressive.amountPerPayday = base.multiply(BigDecimal.valueOf(1.2)).setScale(2, RoundingMode.CEILING);
        aggressive.paydaysToDeadline = paydaysToDeadline;
        aggressive.note = "Build a buffer (helpful if you may skip a month).";

        GoalSuggestionDto relaxed = new GoalSuggestionDto();
        relaxed.label = "Relaxed (-20%)";
        relaxed.amountPerPayday = base.multiply(BigDecimal.valueOf(0.8)).setScale(2, RoundingMode.CEILING);
        relaxed.paydaysToDeadline = paydaysToDeadline;
        relaxed.note = "Lower contribution now, but you may need to increase later.";

        GoalSuggestionsResponseDto resp = new GoalSuggestionsResponseDto();
        resp.goalId = goal.getId();
        resp.currency = currency;
        resp.remainingAmount = remaining;
        resp.paydayDay = paydayDay;
        resp.nextPayday = nextPayday;
        resp.paydaysToDeadline = paydaysToDeadline;
        resp.suggestions = List.of(onTime, aggressive, relaxed);

        return resp;
    }


    private GoalViewDto toViewDto(Goal g) {
        GoalViewDto dto = new GoalViewDto();
        dto.id = g.getId();
        dto.title = g.getTitle();
        dto.description = g.getDescription();
        dto.targetAmount = g.getTargetAmount();
        dto.currentAmount = g.getCurrentAmount();
        dto.deadline = g.getDeadline();

        if (g.getCreatedBy() != null) {
            String fn = g.getCreatedBy().getFirstName() != null ? g.getCreatedBy().getFirstName() : "";
            String ln = g.getCreatedBy().getLastName() != null ? g.getCreatedBy().getLastName() : "";
            dto.createdByName = (fn + " " + ln).trim();
        } else {
            dto.createdByName = null;
        }
        return dto;
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private LocalDate computeNextPayday(LocalDate today, int paydayDay) {

        YearMonth ym = YearMonth.from(today);
        LocalDate thisMonth = LocalDate.of(ym.getYear(), ym.getMonth(), paydayDay);
        if (!today.isAfter(thisMonth)) return thisMonth;

        YearMonth next = ym.plusMonths(1);
        return LocalDate.of(next.getYear(), next.getMonth(), paydayDay);
    }

    private int countPaydaysInclusive(LocalDate firstPayday, LocalDate deadline, int paydayDay) {
        int count = 0;
        LocalDate cursor = firstPayday;

        while (!cursor.isAfter(deadline)) {
            count++;
            YearMonth ym = YearMonth.from(cursor).plusMonths(1);
            cursor = LocalDate.of(ym.getYear(), ym.getMonth(), paydayDay);
        }
        return count;
    }
}