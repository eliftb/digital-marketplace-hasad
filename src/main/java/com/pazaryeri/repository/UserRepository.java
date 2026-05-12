package com.pazaryeri.repository;

import com.pazaryeri.entity.User;
import com.pazaryeri.enums.AccountStatus;
import com.pazaryeri.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findByRole(UserRole role, Pageable pageable);

    Page<User> findByRoleAndStatus(UserRole role, AccountStatus status, Pageable pageable);

    long countByRole(UserRole role);

    long countByStatus(AccountStatus status);
}
