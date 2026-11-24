package com.finfamplan.backend.service;

import com.finfamplan.backend.model.Transaction;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

/**
 * Single place for "reste à vivre" (monthly remaining-to-live) so the
 * dashboard card and its footer pill can never diverge again.
 *
 * Definition: monthlyIncome - fixedExpensesTotal - other expenses recorded
 * this month. Pure function, no repository access, fully unit-testable.
 *
 * Double-counting guards:
 * - FIXED_EXPENSES transactions are excluded from "other expenses": that
 *   category is only a historical record created at confirm-salary time of
 *   fixedExpensesTotal already being deducted — summing it again here would
 *   subtract the same fixed charges twice.
 * - Only EXPENSE-type transactions are summed; a paid bill or an ad-hoc
 *   expense is recorded exactly once as a Transaction, so it is counted
 *   exactly once here too, whatever category it has.
 * - BILL_REVERSAL (INCOME, created by BillController when a bill is
 *   un-marked as paid) is netted against "other expenses": unchecking then
 *   re-checking the same bill creates a fresh BILLS expense transaction each
 *   time without deleting the earlier ones, so without this netting a
 *   check/uncheck/recheck cycle would count the same bill's amount twice
 *   here even though currentBalance only ever reflects it once.
 */
@Service
public class BudgetService {

    private static final String FIXED_EXPENSES_CATEGORY = "FIXED_EXPENSES";
    private static final String BILL_REVERSAL_CATEGORY = "BILL_REVERSAL";

    public BigDecimal monthlyRemaining(
            BigDecimal monthlyIncome,
            BigDecimal fixedExpensesTotal,
            List<Transaction> transactions,
            YearMonth month
    ) {
        BigDecimal otherExpensesThisMonth = sumOtherExpenses(transactions, month)
                .subtract(sumBillReversals(transactions, month));

        return nz(monthlyIncome)
                .subtract(nz(fixedExpensesTotal))
                .subtract(otherExpensesThisMonth);
    }

    private BigDecimal sumOtherExpenses(List<Transaction> transactions, YearMonth month) {
        if (transactions == null) return BigDecimal.ZERO;

        BigDecimal total = BigDecimal.ZERO;
        for (Transaction t : transactions) {
            if (t == null || t.getDate() == null || t.getAmount() == null) continue;
            if (!"EXPENSE".equals(t.getType())) continue;
            if (FIXED_EXPENSES_CATEGORY.equals(t.getCategory())) continue;
            if (!YearMonth.from(t.getDate()).equals(month)) continue;
            total = total.add(t.getAmount());
        }
        return total;
    }

    private BigDecimal sumBillReversals(List<Transaction> transactions, YearMonth month) {
        if (transactions == null) return BigDecimal.ZERO;

        BigDecimal total = BigDecimal.ZERO;
        for (Transaction t : transactions) {
            if (t == null || t.getDate() == null || t.getAmount() == null) continue;
            if (!"INCOME".equals(t.getType())) continue;
            if (!BILL_REVERSAL_CATEGORY.equals(t.getCategory())) continue;
            if (!YearMonth.from(t.getDate()).equals(month)) continue;
            total = total.add(t.getAmount());
        }
        return total;
    }

    private BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
