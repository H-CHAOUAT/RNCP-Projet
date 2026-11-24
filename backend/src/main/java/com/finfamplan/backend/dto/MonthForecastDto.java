package com.finfamplan.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MonthForecastDto {
    public LocalDate payday;
    public BigDecimal highBalance; // committed scenario: income - fixed expenses - known unpaid bills
    public BigDecimal lowBalance;  // highBalance minus a 10% of monthly income margin for unplanned spending
}
