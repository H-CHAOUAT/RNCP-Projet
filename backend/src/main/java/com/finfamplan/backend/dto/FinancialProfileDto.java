package com.finfamplan.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class FinancialProfileDto {
    public BigDecimal monthlyIncome;
    public String currency;
    public List<ExpenseItemDto> expenses;

    public static class ExpenseItemDto {
        public String category;
        public BigDecimal amount;
    }
}
