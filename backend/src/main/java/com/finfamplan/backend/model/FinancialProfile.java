package com.finfamplan.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "financial_profiles")
public class FinancialProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private BigDecimal monthlyIncome = BigDecimal.ZERO;

    @Column(nullable = false)
    private String currency = "EUR";

    @Column(nullable = false)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer paydayDay = 1;

    private LocalDate lastSalaryApplied;

    @Column(nullable = false)
    private Boolean balanceLocked = false;

    @Column(nullable = false)
    private Boolean salaryPendingConfirmation = false;

    private LocalDate lastSalaryDismissedDate;

    @OneToMany(mappedBy = "financialProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpenseItem> expenses = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BigDecimal getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(BigDecimal monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }

    public Integer getPaydayDay() {
        return paydayDay;
    }

    public void setPaydayDay(Integer paydayDay) {
        this.paydayDay = paydayDay;
    }

    public LocalDate getLastSalaryApplied() {
        return lastSalaryApplied;
    }

    public void setLastSalaryApplied(LocalDate lastSalaryApplied) {
        this.lastSalaryApplied = lastSalaryApplied;
    }

    public Boolean getBalanceLocked() {
        return balanceLocked;
    }

    public void setBalanceLocked(Boolean balanceLocked) {
        this.balanceLocked = balanceLocked;
    }

    public Boolean getSalaryPendingConfirmation() {
        return salaryPendingConfirmation;
    }

    public void setSalaryPendingConfirmation(Boolean salaryPendingConfirmation) {
        this.salaryPendingConfirmation = salaryPendingConfirmation;
    }

    public LocalDate getLastSalaryDismissedDate() {
        return lastSalaryDismissedDate;
    }

    public void setLastSalaryDismissedDate(LocalDate lastSalaryDismissedDate) {
        this.lastSalaryDismissedDate = lastSalaryDismissedDate;
    }

    public List<ExpenseItem> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<ExpenseItem> expenses) {
        this.expenses = expenses;
    }
}