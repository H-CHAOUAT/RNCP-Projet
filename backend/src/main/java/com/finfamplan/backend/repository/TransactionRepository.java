package com.finfamplan.backend.repository;

import com.finfamplan.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser_UserIdOrderByDateDesc(Long userId);

    List<Transaction> findByUser_FamilyGroup_IdOrderByDateDesc(Long familyGroupId);
}
