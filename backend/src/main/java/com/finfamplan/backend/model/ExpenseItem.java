package com.finfamplan.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "expense_items")
public class ExpenseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "financial_profile_id", nullable = false)
    @JsonIgnore
    private FinancialProfile financialProfile;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public FinancialProfile getFinancialProfile() { return financialProfile; }
    public void setFinancialProfile(FinancialProfile financialProfile) { this.financialProfile = financialProfile; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
