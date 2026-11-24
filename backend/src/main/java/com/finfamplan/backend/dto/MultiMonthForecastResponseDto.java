package com.finfamplan.backend.dto;

import java.util.List;

/** Story 6: multi-month forecast with a simple, explainable low/high range. */
public class MultiMonthForecastResponseDto {
    public String currency;
    public List<MonthForecastDto> months;
    public String assumptionNote;
}
