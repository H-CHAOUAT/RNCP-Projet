package com.finfamplan.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class SetGoalPlanRequest {
    @NotBlank
    public String label;

    @NotNull
    @Positive
    public BigDecimal amountPerPayday;
}
