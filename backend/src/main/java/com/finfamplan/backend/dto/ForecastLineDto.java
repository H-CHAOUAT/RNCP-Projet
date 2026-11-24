package com.finfamplan.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** One unpaid, dated bill counted between today and the next payday. */
public class ForecastLineDto {
    public LocalDate date;
    public String label;
    public BigDecimal amount;       // negative (money leaving the balance)
    public BigDecimal balanceAfter; // running balance after this line
}
