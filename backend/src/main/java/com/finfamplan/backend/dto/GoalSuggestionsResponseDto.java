package com.finfamplan.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class GoalSuggestionsResponseDto {
    public Long goalId;
    public String currency;

    public BigDecimal remainingAmount;
    public Integer paydaysToDeadline;
    public Integer paydayDay;
    public LocalDate nextPayday;

    public List<GoalSuggestionDto> suggestions;
}