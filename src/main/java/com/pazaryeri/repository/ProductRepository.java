package com.pazaryeri.repository;

import com.pazaryeri.entity.Product;
import com.pazaryeri.enums.AccountStatus;
import com.pazaryeri.enums.DeliveryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findByIdAndActiveTrue(Long id);

    Page<Product> findByProducerProfileIdAndActiveTrue(Long producerProfileId, Pageable pageable);

    Page<Product> findByFeaturedTrueAndActiveTrue(Pageable pageable);

    @Query("""
           SELECT p FROM Product p
           JOIN p.producerProfile pp
           JOIN p.category c
           WHERE p.active = true
           AND pp.approvalStatus = :activeStatus
           AND (:categoryId IS NULL OR c.id = :categoryId)
           AND (:cityId IS NULL OR pp.city.id = :cityId)
           AND (:deliveryType IS NULL OR p.deliveryType = :deliveryType OR p.deliveryType = :bothDeliveryType)
           AND (:minPrice IS NULL OR p.price >= :minPrice)
           AND (:maxPrice IS NULL OR p.price <= :maxPrice)
           """)
    Page<Product> searchProducts(@Param("activeStatus") AccountStatus activeStatus,
                                 @Param("bothDeliveryType") DeliveryType bothDeliveryType,
                                 @Param("categoryId") Long categoryId,
                                 @Param("cityId") Long cityId,
                                 @Param("deliveryType") DeliveryType deliveryType,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 Pageable pageable);

    @Query("""
           SELECT p FROM Product p
           JOIN p.producerProfile pp
           JOIN p.category c
           WHERE p.active = true
           AND pp.approvalStatus = :activeStatus
           AND (LOWER(p.name) LIKE :searchPattern
                OR LOWER(p.description) LIKE :searchPattern)
           AND (:categoryId IS NULL OR c.id = :categoryId)
           AND (:cityId IS NULL OR pp.city.id = :cityId)
           AND (:deliveryType IS NULL OR p.deliveryType = :deliveryType OR p.deliveryType = :bothDeliveryType)
           AND (:minPrice IS NULL OR p.price >= :minPrice)
           AND (:maxPrice IS NULL OR p.price <= :maxPrice)
           """)
    Page<Product> searchProductsWithKeyword(@Param("searchPattern") String searchPattern,
                                            @Param("activeStatus") AccountStatus activeStatus,
                                            @Param("bothDeliveryType") DeliveryType bothDeliveryType,
                                            @Param("categoryId") Long categoryId,
                                            @Param("cityId") Long cityId,
                                            @Param("deliveryType") DeliveryType deliveryType,
                                            @Param("minPrice") BigDecimal minPrice,
                                            @Param("maxPrice") BigDecimal maxPrice,
                                            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.producerProfile.id = :producerId AND p.active = true")
    Page<Product> findByProducerId(@Param("producerId") Long producerId, Pageable pageable);

    boolean existsBySlug(String slug);

    long countByActiveTrue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.producerProfile.id = :producerId")
    long countByProducerId(@Param("producerId") Long producerId);
}
