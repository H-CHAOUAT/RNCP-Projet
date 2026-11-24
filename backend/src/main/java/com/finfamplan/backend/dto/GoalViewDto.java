package com.finfamplan.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class GoalViewDto {
    public Long id;
    public String title;
    public String description;

    public BigDecimal targetAmount;
    public BigDecimal currentAmount;

    public LocalDate deadline;
    public LocalDateTime createdAt;

    public String planLabel;
    public BigDecimal planAmountPerPayday;
    public BigDecimal remainingAmount;

    // Story 8: savings effort, always computed, not just at creation.
    public BigDecimal monthlyEffort;
    public String effortUnavailableReason;

    // Story 9: derived from deadline, never stored/chosen — SHORT/MEDIUM/LONG.
    public String horizon;

    public Long userId;
    public Long createdByUserId;
    public String createdByName;
    public Long familyGroupId;
}