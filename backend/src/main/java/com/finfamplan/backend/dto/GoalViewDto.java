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

    public Long userId;
    public Long createdByUserId;
    public String createdByName;
    public Long familyGroupId;
}