package com.pazaryeri.repository;

import com.pazaryeri.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserEmail(String email);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.product WHERE c.user.email = :email")
    Optional<Cart> findByUserEmailWithItems(@Param("email") String email);

    boolean existsByUserEmail(String email);
}
