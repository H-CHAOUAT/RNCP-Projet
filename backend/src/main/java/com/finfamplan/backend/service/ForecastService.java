package com.finfamplan.backend.service;

import com.finfamplan.backend.dto.ForecastLineDto;
import com.finfamplan.backend.dto.ForecastResponseDto;
import com.finfamplan.backend.dto.MonthForecastDto;
import com.finfamplan.backend.dto.MultiMonthForecastResponseDto;
import com.finfamplan.backend.model.Bill;
import com.finfamplan.backend.model.ExpenseItem;
import com.finfamplan.backend.model.FinancialProfile;
import com.finfamplan.backend.repository.BillRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Stories 1, 2, 5, 6: balance forecast until the next payday, the first
 * due item that would push it negative, the user's alert threshold, and a
 * simple multi-month projection with a low/high range.
 *
 * Deliberately only counts UNPAID, DATED bills. Paid bills already moved
 * the real currentBalance at the moment they were marked paid
 * (BillController.togglePaid), so including them here would double-count
 * the same euro twice. Fixed monthly expenses (ExpenseItem) are not dated
 * individually — they are applied in bulk at confirm-salary time, which is
 * exactly the payday boundary this forecast stops at, so they don't need a
 * separate line before that boundary either.
 */
@Service
public class ForecastService {

    /** Story 6 assumption: the "low" estimate is the committed ("high")
     *  balance minus this fraction of monthly income, as a simple, explained
     *  margin for unplanned spending — not based on any spending history. */
    private static final BigDecimal LOW_ESTIMATE_MARGIN = new BigDecimal("0.10");

    private final BillRepository billRepo;
    private final PaydayService paydayService;

    public ForecastService(BillRepository billRepo, PaydayService paydayService) {
        this.billRepo = billRepo;
        this.paydayService = paydayService;
    }

    public ForecastResponseDto forecastUntilNextPayday(FinancialProfile fp) {
        LocalDate today = LocalDate.now();
        int paydayDay = paydayService.clampPaydayDay(fp.getPaydayDay());
        LocalDate nextPayday = paydayService.computeNextPayday(today, paydayDay);

        List<Bill> dueBills = billRepo.findByUser_UserIdOrderByDueDateAsc(fp.getUser().getUserId())
                .stream()
                .filter(b -> !Boolean.TRUE.equals(b.getPaid()))
                .filter(b -> b.getDueDate() != null && !b.getDueDate().isAfter(nextPayday))
                .toList();

        BigDecimal running = nz(fp.getCurrentBalance());
        List<ForecastLineDto> lines = new ArrayList<>();

        boolean atRisk = false;
        LocalDate firstAtRiskDate = null;
        String atRiskTitle = null;
        BigDecimal shortfall = null;

        for (Bill b : dueBills) {
            BigDecimal amount = nz(b.getAmount());
            running = running.subtract(amount);

            ForecastLineDto line = new ForecastLineDto();
            line.date = b.getDueDate();
            line.label = b.getTitle();
            line.amount = amount.negate();
            line.balanceAfter = running;
            lines.add(line);

            if (!atRisk && running.compareTo(BigDecimal.ZERO) < 0) {
                atRisk = true;
                firstAtRiskDate = b.getDueDate();
                atRiskTitle = b.getTitle();
                shortfall = running.negate();
            }
        }

        ForecastResponseDto dto = new ForecastResponseDto();
        dto.currency = fp.getCurrency() != null ? fp.getCurrency() : "EUR";
        dto.currentBalance = nz(fp.getCurrentBalance());
        dto.nextPayday = nextPayday;
        dto.forecastBalance = running;
        dto.lines = lines;
        dto.atRisk = atRisk;
        dto.firstAtRiskDate = firstAtRiskDate;
        dto.atRiskItemTitle = atRiskTitle;
        dto.shortfallAmount = shortfall;
        dto.alertThreshold = nz(fp.getAlertThreshold());
        dto.belowThreshold = running.compareTo(dto.alertThreshold) < 0;
        return dto;
    }

    public MultiMonthForecastResponseDto forecastMultiMonth(FinancialProfile fp, int months) {
        if (months < 1) months = 1;
        if (months > 24) months = 24; // sane upper bound, not part of the acceptance criteria

        int paydayDay = paydayService.clampPaydayDay(fp.getPaydayDay());
        BigDecimal income = nz(fp.getMonthlyIncome());
        BigDecimal fixedExpensesTotal = BigDecimal.ZERO;
        if (fp.getExpenses() != null) {
            for (ExpenseItem e : fp.getExpenses()) {
                fixedExpensesTotal = fixedExpensesTotal.add(nz(e.getAmount()));
            }
        }

        List<Bill> unpaidBills = billRepo.findByUser_UserIdOrderByDueDateAsc(fp.getUser().getUserId())
                .stream()
                .filter(b -> !Boolean.TRUE.equals(b.getPaid()))
                .filter(b -> b.getDueDate() != null)
                .toList();

        BigDecimal margin = income.multiply(LOW_ESTIMATE_MARGIN);

        List<MonthForecastDto> result = new ArrayList<>();
        BigDecimal balance = nz(fp.getCurrentBalance());
        LocalDate windowStart = LocalDate.now();

        for (int i = 0; i < months; i++) {
            LocalDate payday = paydayService.computeNextPayday(windowStart, paydayDay);
            LocalDate windowStartFinal = windowStart;

            BigDecimal billsThisWindow = unpaidBills.stream()
                    .filter(b -> !b.getDueDate().isBefore(windowStartFinal) && !b.getDueDate().isAfter(payday))
                    .map(Bill::getAmount)
                    .map(this::nz)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            balance = balance.add(income).subtract(fixedExpensesTotal).subtract(billsThisWindow);

            MonthForecastDto m = new MonthForecastDto();
            m.payday = payday;
            m.highBalance = balance;
            m.lowBalance = balance.subtract(margin);
            result.add(m);

            windowStart = payday.plusDays(1);
        }

        MultiMonthForecastResponseDto resp = new MultiMonthForecastResponseDto();
        resp.currency = fp.getCurrency() != null ? fp.getCurrency() : "EUR";
        resp.months = result;
        resp.assumptionNote = "Scénario haut : revenus, charges fixes et factures connues appliqués comme prévu. "
                + "Scénario bas : scénario haut moins 10 % du revenu mensuel, par prudence pour des dépenses imprévues.";
        return resp;
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
