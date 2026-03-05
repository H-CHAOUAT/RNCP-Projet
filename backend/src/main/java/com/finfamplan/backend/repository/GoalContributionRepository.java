package com.finfamplan.backend.repository;

import com.finfamplan.backend.model.GoalContribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalContributionRepository extends JpaRepository<GoalContribution, Long> {
    List<GoalContribution> findByGoal_Id(Long goalId);
}