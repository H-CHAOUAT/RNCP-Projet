package com.finfamplan.backend.service;

import com.finfamplan.backend.model.Transaction;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BudgetServiceTest {

    private final BudgetService service = new BudgetService();
    private final YearMonth thisMonth = YearMonth.now();

    private Transaction tx(String type, String category, String amount, LocalDate date) {
        Transaction t = new Transaction();
        t.setType(type);
        t.setCategory(category);
        t.setAmount(new BigDecimal(amount));
        t.setDate(date);
        return t;
    }

    @Test
    void nominalCase_incomeMinusFixedMinusOtherExpenses() {
        // 1900 income, 920 fixed charges, 0 other expenses this month -> 980
        BigDecimal result = service.monthlyRemaining(
                new BigDecimal("1900"),
                new BigDecimal("920"),
                List.of(),
                thisMonth
        );
        assertEquals(new BigDecimal("980"), result);
    }

    @Test
    void billAlreadyPaid_isNotCountedTwice() {
        // The FIXED_EXPENSES transaction is the historical record of
        // fixedExpensesTotal already being applied at confirm-salary — it must
        // be excluded, or 920 would be subtracted twice (once via the
        // fixedExpensesTotal param, once via this transaction).
        List<Transaction> transactions = List.of(
                tx("EXPENSE", "FIXED_EXPENSES", "920", thisMonth.atDay(5)),
                tx("EXPENSE", "BILLS", "300", thisMonth.atDay(10)) // a real, separate paid bill
        );
        BigDecimal result = service.monthlyRemaining(
                new BigDecimal("1900"),
                new BigDecimal("920"),
                transactions,
                thisMonth
        );
        // 1900 - 920 (param) - 300 (the real bill; FIXED_EXPENSES excluded) = 680
        assertEquals(new BigDecimal("680"), result);
    }

    @Test
    void noIncome_resultIsNegativeOfExpenses() {
        BigDecimal result = service.monthlyRemaining(
                BigDecimal.ZERO,
                new BigDecimal("920"),
                List.of(),
                thisMonth
        );
        assertEquals(new BigDecimal("-920"), result);
    }

    @Test
    void expensesHigherThanIncome_negativeResultShownAsIs() {
        List<Transaction> transactions = List.of(
                tx("EXPENSE", "GROCERIES", "1500", thisMonth.atDay(2))
        );
        BigDecimal result = service.monthlyRemaining(
                new BigDecimal("1900"),
                new BigDecimal("920"),
                transactions,
                thisMonth
        );
        // 1900 - 920 - 1500 = -520, not clamped to zero
        assertEquals(new BigDecimal("-520"), result);
    }

    @Test
    void noExpensesThisMonth_equalsIncomeMinusFixedOnly() {
        BigDecimal result = service.monthlyRemaining(
                new BigDecimal("1900"),
                new BigDecimal("920"),
                List.of(),
                thisMonth
        );
        assertEquals(new BigDecimal("980"), result);
    }

    @Test
    void incomeAppliedOnPayDate_fixedExpensesTransactionExcludedRegardlessOfDate() {
        // confirm-salary creates both a SALARY income tx and a FIXED_EXPENSES
        // expense tx dated today (the pay date). Neither should distort the
        // result: SALARY is INCOME (filtered out by type), FIXED_EXPENSES is
        // excluded by category.
        LocalDate payDate = LocalDate.now();
        List<Transaction> transactions = List.of(
                tx("INCOME", "SALARY", "1900", payDate),
                tx("EXPENSE", "FIXED_EXPENSES", "920", payDate)
        );
        BigDecimal result = service.monthlyRemaining(
                new BigDecimal("1900"),
                new BigDecimal("920"),
                transactions,
                thisMonth
        );
        assertEquals(new BigDecimal("980"), result);
    }

    @Test
    void expensesFromAnotherMonth_areIgnored() {
        List<Transaction> transactions = List.of(
                tx("EXPENSE", "GROCERIES", "500", thisMonth.minusMonths(1).atDay(15))
        );
        BigDecimal result = service.monthlyRemaining(
                new BigDecimal("1900"),
                new BigDecimal("920"),
                transactions,
                thisMonth
        );
        assertEquals(new BigDecimal("980"), result);
    }

    @Test
    void incomeTransactionsThisMonth_doNotReduceRemaining() {
        // An ad-hoc INCOME transaction (e.g. ALLOWANCE) must not be summed as
        // an expense; only the configured monthlyIncome parameter counts.
        List<Transaction> transactions = List.of(
                tx("INCOME", "ALLOWANCE", "50", thisMonth.atDay(3))
        );
        BigDecimal result = service.monthlyRemaining(
                new BigDecimal("1900"),
                new BigDecimal("920"),
                transactions,
                thisMonth
        );
        assertEquals(new BigDecimal("980"), result);
    }

    @Test
    void billUncheckedThenRechecked_isNotCountedTwice() {
        // Reproduces a real scenario: the user marks a bill paid, unmarks it,
        // then marks it paid again — BillController logs a new BILLS expense
        // transaction on every "paid" transition and a BILL_REVERSAL income
        // transaction on every "unpaid" transition, without deleting earlier
        // rows. currentBalance nets out correctly (-300 +300 -300 = -300),
        // and monthlyRemaining must match that, not count 600.
        List<Transaction> transactions = List.of(
                tx("EXPENSE", "BILLS", "300", thisMonth.atDay(1)),   // checked
                tx("INCOME", "BILL_REVERSAL", "300", thisMonth.atDay(2)), // unchecked
                tx("EXPENSE", "BILLS", "300", thisMonth.atDay(3))    // rechecked
        );
        BigDecimal result = service.monthlyRemaining(
                new BigDecimal("1900"),
                new BigDecimal("920"),
                transactions,
                thisMonth
        );
        // 1900 - 920 - 300 (net: 300 + 300 - 300) = 680, not 380
        assertEquals(new BigDecimal("680"), result);
    }

    @Test
    void nullFields_defaultToZeroWithoutThrowing() {
        BigDecimal result = service.monthlyRemaining(null, null, null, thisMonth);
        assertEquals(BigDecimal.ZERO, result);
    }
}
