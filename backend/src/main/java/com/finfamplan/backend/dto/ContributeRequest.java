package com.finfamplan.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ContributeRequest {

    @NotNull
    public BigDecimal amount;
}