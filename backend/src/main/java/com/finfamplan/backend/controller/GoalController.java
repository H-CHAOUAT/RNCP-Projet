package com.finfamplan.backend.controller;

import com.finfamplan.backend.dto.*;
import com.finfamplan.backend.model.*;
import com.finfamplan.backend.repository.*;
import com.finfamplan.backend.security.AccessGuard;
import com.finfamplan.backend.service.PaydayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalRepository goalRepo;
    private final GoalContributionRepository contribRepo;
    private final UserRepository userRepo;
    private final FinancialProfileRepository financialRepo;
    private final AccessGuard accessGuard;
    private final PaydayService paydayService;

    public GoalController(
            GoalRepository goalRepo,
            GoalContributionRepository contribRepo,
            UserRepository userRepo,
            FinancialProfileRepository financialRepo,
            AccessGuard accessGuard,
            PaydayService paydayService
    ) {
        this.goalRepo = goalRepo;
        this.contribRepo = contribRepo;
        this.userRepo = userRepo;
        this.financialRepo = financialRepo;
        this.accessGuard = accessGuard;
        this.paydayService = paydayService;
    }

    @GetMapping("/user/{userId}")
    public List<GoalViewDto> list(@PathVariable Long userId, HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        return goalRepo.findByUser_UserId(userId)
                .stream()
                .map(this::toViewDto)
                .toList();
    }

    @GetMapping("/family/{familyGroupId}")
    public List<GoalViewDto> listByFamily(@PathVariable Long familyGroupId, HttpServletRequest request) {
        User caller = userRepo.findById(accessGuard.currentUserId(request))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Veuillez vous reconnecter"));
        if (caller.getFamilyGroup() == null || !caller.getFamilyGroup().getId().equals(familyGroupId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ce foyer ne vous appartient pas");
        }
        return goalRepo.findByUser_FamilyGroup_Id(familyGroupId)
                .stream()
                .map(this::toViewDto)
                .toList();
    }

    @PostMapping("/user/{userId}")
    public GoalViewDto create(@PathVariable Long userId, @RequestBody @Valid CreateGoalRequest req,
                              HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        Goal g = new Goal();
        g.setUser(user);

        g.setTitle(req.title);
        g.setDescription(req.description);
        g.setDeadline(req.deadline);

        g.setTargetAmount(req.targetAmount);
        g.setCurrentAmount(BigDecimal.ZERO);

        g.setCreatedBy(user);

        Goal saved = goalRepo.save(g);
        return toViewDto(saved);
    }

    @DeleteMapping("/{goalId}/user/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long goalId, @PathVariable Long userId, HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);
        Goal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Objectif introuvable"));

        if (!goal.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cet objectif ne vous appartient pas");
        }

        // goal_contributions rows are removed by the ON DELETE CASCADE foreign key
        goalRepo.delete(goal);
    }

    @PatchMapping("/{goalId}/plan/user/{userId}")
    public GoalViewDto setPlan(
            @PathVariable Long goalId,
            @PathVariable Long userId,
            @RequestBody @Valid SetGoalPlanRequest req,
            HttpServletRequest request
    ) {
        accessGuard.requireSelf(request, userId);

        Goal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Objectif introuvable"));

        if (!goal.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cet objectif ne vous appartient pas");
        }

        goal.setPlanLabel(req.label);
        goal.setPlanAmountPerPayday(req.amountPerPayday);
        goalRepo.save(goal);

        return toViewDto(goal);
    }

    @PostMapping("/{goalId}/contribute/user/{userId}")
    @Transactional
    public GoalViewDto contribute(
            @PathVariable Long goalId,
            @PathVariable Long userId,
            @RequestBody @Valid ContributeRequest req,
            HttpServletRequest request
    ) {
        accessGuard.requireSelf(request, userId);
        if (req.amount == null || req.amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le montant doit être supérieur à 0");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        Goal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Objectif introuvable"));

        if (!goal.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cet objectif ne vous appartient pas");
        }

        FinancialProfile fp = financialRepo.findByUser_UserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profil financier manquant"));

        BigDecimal current = fp.getCurrentBalance() != null ? fp.getCurrentBalance() : BigDecimal.ZERO;

        if (current.compareTo(req.amount) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solde insuffisant");
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
    public GoalSuggestionsResponseDto suggestions(@PathVariable Long goalId, @PathVariable Long userId,
                                                  HttpServletRequest request) {
        accessGuard.requireSelf(request, userId);

        Goal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Objectif introuvable"));

        if (!goal.getUser().getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cet objectif ne vous appartient pas");
        }

        if (goal.getDeadline() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une date limite est requise pour calculer des suggestions");
        }

        FinancialProfile fp = financialRepo.findByUser_UserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profil financier manquant"));

        String currency = fp.getCurrency() != null ? fp.getCurrency() : "EUR";
        int paydayDay = paydayService.clampPaydayDay(fp.getPaydayDay());

        BigDecimal target = nz(goal.getTargetAmount());
        BigDecimal current = nz(goal.getCurrentAmount());
        BigDecimal remaining = target.subtract(current);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;

        LocalDate today = LocalDate.now();
        LocalDate deadline = goal.getDeadline();

        if (deadline.isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date limite est déjà passée");
        }

        LocalDate nextPayday = paydayService.computeNextPayday(today, paydayDay);
        int paydaysToDeadline = paydayService.countPaydaysInclusive(nextPayday, deadline, paydayDay);

        if (paydaysToDeadline <= 0) paydaysToDeadline = 1;

        BigDecimal base = remaining
                .divide(BigDecimal.valueOf(paydaysToDeadline), 2, RoundingMode.CEILING);

        GoalSuggestionDto onTime = new GoalSuggestionDto();
        onTime.label = "Dans les temps";
        onTime.amountPerPayday = base;
        onTime.paydaysToDeadline = paydaysToDeadline;
        onTime.note = "Montant recommandé à chaque paie pour atteindre la date limite.";

        GoalSuggestionDto aggressive = new GoalSuggestionDto();
        aggressive.label = "Rapide (+20%)";
        aggressive.amountPerPayday = base.multiply(BigDecimal.valueOf(1.2)).setScale(2, RoundingMode.CEILING);
        aggressive.paydaysToDeadline = paydaysToDeadline;
        aggressive.note = "Constituez une marge (utile si vous sautez un mois).";

        GoalSuggestionDto relaxed = new GoalSuggestionDto();
        relaxed.label = "Souple (-20%)";
        relaxed.amountPerPayday = base.multiply(BigDecimal.valueOf(0.8)).setScale(2, RoundingMode.CEILING);
        relaxed.paydaysToDeadline = paydaysToDeadline;
        relaxed.note = "Contribution plus faible pour l'instant, à augmenter peut-être plus tard.";

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

        dto.planLabel = g.getPlanLabel();
        dto.planAmountPerPayday = g.getPlanAmountPerPayday();
        dto.remainingAmount = nz(g.getTargetAmount()).subtract(nz(g.getCurrentAmount())).max(BigDecimal.ZERO);

        computeEffort(g, dto);
        dto.horizon = computeHorizon(g.getDeadline());

        if (g.getCreatedBy() != null) {
            String fn = g.getCreatedBy().getFirstName() != null ? g.getCreatedBy().getFirstName() : "";
            String ln = g.getCreatedBy().getLastName() != null ? g.getCreatedBy().getLastName() : "";
            dto.createdByName = (fn + " " + ln).trim();
        } else {
            dto.createdByName = null;
        }
        return dto;
    }

    /**
     * Story 8: a monthly ("per payday") savings effort shown permanently on
     * every goal, not just once at creation time. Same formula as
     * suggestions()'s "On time" plan, but degrades to a clear reason instead
     * of throwing, since this runs for every goal in a list.
     */
    private void computeEffort(Goal g, GoalViewDto dto) {
        if (g.getDeadline() == null) {
            dto.monthlyEffort = null;
            dto.effortUnavailableReason = "Aucune date limite définie";
            return;
        }

        LocalDate today = LocalDate.now();
        if (g.getDeadline().isBefore(today)) {
            dto.monthlyEffort = null;
            dto.effortUnavailableReason = "La date limite est déjà passée";
            return;
        }

        financialRepo.findByUser_UserId(g.getUser().getUserId()).ifPresentOrElse(fp -> {
            int paydayDay = paydayService.clampPaydayDay(fp.getPaydayDay());
            BigDecimal remaining = nz(g.getTargetAmount()).subtract(nz(g.getCurrentAmount())).max(BigDecimal.ZERO);

            LocalDate nextPayday = paydayService.computeNextPayday(today, paydayDay);
            int n = paydayService.countPaydaysInclusive(nextPayday, g.getDeadline(), paydayDay);
            if (n <= 0) n = 1;

            dto.monthlyEffort = remaining.divide(BigDecimal.valueOf(n), 2, RoundingMode.CEILING);
            dto.effortUnavailableReason = null;
        }, () -> {
            dto.monthlyEffort = null;
            dto.effortUnavailableReason = "Profil financier manquant";
        });
    }

    /**
     * Story 9: horizon is derived from the deadline, never stored or chosen
     * by the user — the deadline is mandatory on every goal, so there is no
     * "no deadline" case to handle. Thresholds are a documented assumption:
     * <=12 months = short term, <=36 months = medium term, beyond = long term.
     */
    private String computeHorizon(LocalDate deadline) {
        if (deadline == null) return null;
        long months = Period.between(LocalDate.now(), deadline).toTotalMonths();
        if (months < 6) return "SHORT";
        if (months <= 18) return "MEDIUM";
        return "LONG";
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}