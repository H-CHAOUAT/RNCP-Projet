package com.finfamplan.backend.repository;

import com.finfamplan.backend.model.FinancialProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FinancialProfileRepository extends JpaRepository<FinancialProfile, Long> {
    Optional<FinancialProfile> findByUser_UserId(Long userId);
}
