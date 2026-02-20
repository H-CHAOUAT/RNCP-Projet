package com.finfamplan.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class FinancialProfileDto {
    public BigDecimal monthlyIncome;
    public BigDecimal currentBalance;
    public Integer paydayDay;
    public LocalDate lastSalaryApplied;

    public String currency;
    public List<ExpenseItemDto> expenses;

    public static class ExpenseItemDto {
        public String category;
        public BigDecimal amount;
    }
}

