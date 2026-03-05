package com.finfamplan.backend.repository;

import com.finfamplan.backend.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUser_UserId(Long userId);
}