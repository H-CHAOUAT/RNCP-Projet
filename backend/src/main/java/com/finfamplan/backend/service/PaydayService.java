package com.finfamplan.backend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;

/**
 * Payday-cycle date math shared by goal planning (GoalController) and
 * balance forecasting (ForecastService). Extracted from GoalController so
 * both features use the exact same "next payday" / "paydays between two
 * dates" logic instead of two copies drifting apart.
 */
@Service
public class PaydayService {

    /** Clamp a raw payday-day-of-month to a safe [1, 28] range. */
    public int clampPaydayDay(Integer rawPaydayDay) {
        int day = rawPaydayDay != null ? rawPaydayDay : 1;
        return Math.max(1, Math.min(28, day));
    }

    /** The next occurrence of paydayDay on or after today. */
    public LocalDate computeNextPayday(LocalDate today, int paydayDay) {
        YearMonth ym = YearMonth.from(today);
        LocalDate thisMonth = LocalDate.of(ym.getYear(), ym.getMonth(), paydayDay);
        if (!today.isAfter(thisMonth)) return thisMonth;

        YearMonth next = ym.plusMonths(1);
        return LocalDate.of(next.getYear(), next.getMonth(), paydayDay);
    }

    /** Number of monthly paydays from firstPayday to deadline, both inclusive. */
    public int countPaydaysInclusive(LocalDate firstPayday, LocalDate deadline, int paydayDay) {
        int count = 0;
        LocalDate cursor = firstPayday;

        while (!cursor.isAfter(deadline)) {
            count++;
            YearMonth ym = YearMonth.from(cursor).plusMonths(1);
            cursor = LocalDate.of(ym.getYear(), ym.getMonth(), paydayDay);
        }
        return count;
    }
}
