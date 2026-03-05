package com.finfamplan.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateGoalRequest {

    @NotBlank
    public String title;

    @NotNull
    public BigDecimal targetAmount;
}