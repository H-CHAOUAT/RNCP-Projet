package com.finfamplan.backend.repository;

import com.finfamplan.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Find all members of a family group
    List<User> findByFamilyGroup_Id(Long familyGroupId);
}
