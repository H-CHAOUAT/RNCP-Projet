package com.finfamplan.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateGoalRequest {
    @NotBlank
    public String title;

    public String description;

    @NotNull
    public BigDecimal targetAmount;

    public LocalDate deadline;
}