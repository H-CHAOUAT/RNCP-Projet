package com.finfamplan.backend.dto;

import com.finfamplan.backend.model.Transaction;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Story 4: transaction history filtered by month/category, with a total per category. */
public class TransactionsResponseDto {
    public List<Transaction> transactions;
    public Map<String, BigDecimal> totalsByCategory;
}
