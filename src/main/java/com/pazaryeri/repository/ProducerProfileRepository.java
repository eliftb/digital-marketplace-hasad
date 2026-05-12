package com.pazaryeri.repository;

import com.pazaryeri.entity.ProducerProfile;
import com.pazaryeri.enums.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProducerProfileRepository extends JpaRepository<ProducerProfile, Long> {

    Optional<ProducerProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    Page<ProducerProfile> findByApprovalStatus(AccountStatus status, Pageable pageable);

    @Query("""
           SELECT pp FROM ProducerProfile pp
           WHERE (:search IS NULL OR pp.storeName LIKE CONCAT('%', :search, '%'))
           AND (:cityId IS NULL OR pp.city.id = :cityId)
           AND (:status IS NULL OR pp.approvalStatus = :status)
           """)
    Page<ProducerProfile> searchProducers(@Param("search") String search,
                                          @Param("cityId") Long cityId,
                                          @Param("status") AccountStatus status,
                                          Pageable pageable);

    long countByApprovalStatus(AccountStatus status);
}
