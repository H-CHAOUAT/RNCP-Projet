package com.finfamplan.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Stories 1, 2 and 5: forecast balance until the next payday, first at-risk
 *  due date if any, and whether the forecast is below the user's alert
 *  threshold. */
public class ForecastResponseDto {
    public String currency;
    public BigDecimal currentBalance;
    public LocalDate nextPayday;
    public BigDecimal forecastBalance;
    public List<ForecastLineDto> lines;

    public boolean atRisk;
    public LocalDate firstAtRiskDate;
    public String atRiskItemTitle;
    public BigDecimal shortfallAmount;

    public BigDecimal alertThreshold;
    public boolean belowThreshold;
}
