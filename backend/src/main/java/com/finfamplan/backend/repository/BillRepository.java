package com.finfamplan.backend.repository;

import com.finfamplan.backend.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUser_UserIdOrderByDueDateAsc(Long userId);
    List<Bill> findByFamilyGroup_IdOrderByDueDateAsc(Long familyGroupId);
}
