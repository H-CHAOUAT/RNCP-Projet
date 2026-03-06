package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.ContributeRequest;
import com.finfamplan.backend.dto.CreateGoalRequest;
import com.finfamplan.backend.model.FinancialProfile;
import com.finfamplan.backend.model.Goal;
import com.finfamplan.backend.model.GoalContribution;
import com.finfamplan.backend.model.User;
import com.finfamplan.backend.repository.FinancialProfileRepository;
import com.finfamplan.backend.repository.GoalContributionRepository;
import com.finfamplan.backend.repository.GoalRepository;
import com.finfamplan.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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

    // List goals for a user
    @GetMapping("/user/{userId}")
    public List<Goal> list(@PathVariable Long userId) {
        return goalRepo.findByUser_UserId(userId);
    }

    // Create a goal for a user
    @PostMapping("/user/{userId}")
    public Goal create(@PathVariable Long userId, @RequestBody @Valid CreateGoalRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Goal g = new Goal();
        g.setUser(user);
        g.setTitle(req.title);
        g.setTargetAmount(req.targetAmount);
        g.setCurrentAmount(BigDecimal.ZERO);

        return goalRepo.save(g);
    }

    // Contribute to a goal AND deduct from current balance (atomic)
    @PostMapping("/{goalId}/contribute/user/{userId}")
    @Transactional
    public Goal contribute(
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

        // Security minimal: ensure the goal belongs to the user
        if (!goal.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your goal");
        }

        FinancialProfile fp = financialRepo.findByUser_UserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Financial profile missing"));

        BigDecimal current = fp.getCurrentBalance() != null ? fp.getCurrentBalance() : BigDecimal.ZERO;

        // prevent negative balance
        if (current.compareTo(req.amount) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient balance");
        }

        // 1) deduct balance
        fp.setCurrentBalance(current.subtract(req.amount));
        financialRepo.save(fp);

        // 2) update goal
        BigDecimal goalCurrent = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : BigDecimal.ZERO;
        goal.setCurrentAmount(goalCurrent.add(req.amount));
        goalRepo.save(goal);

        // 3) create contribution row
        GoalContribution c = new GoalContribution();
        c.setGoal(goal);
        c.setUser(user);
        c.setAmount(req.amount);
        contribRepo.save(c);

        return goal;
    }
}