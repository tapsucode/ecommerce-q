package com.inventorypro.repository;

import com.inventorypro.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    
    Optional<ProductVariant> findBySku(String sku);
    
    List<ProductVariant> findByProductId(Long productId);
    
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.product.id = :productId AND pv.active = true")
    List<ProductVariant> findActiveVariantsByProductId(Long productId);
    
    Boolean existsBySku(String sku);
}