package com.inventorypro.repository;

import com.inventorypro.model.VariantSearchAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VariantSearchAttributeRepository extends JpaRepository<VariantSearchAttribute, Long> {
    
    List<VariantSearchAttribute> findByVariantId(Long variantId);
    
    List<VariantSearchAttribute> findByProductId(Long productId);
    
    @Query("SELECT vsa FROM VariantSearchAttribute vsa WHERE vsa.productId = :productId AND vsa.attributeName = :attributeName")
    List<VariantSearchAttribute> findByProductIdAndAttributeName(@Param("productId") Long productId, 
                                                                @Param("attributeName") String attributeName);
    
    @Modifying
    @Query("DELETE FROM VariantSearchAttribute vsa WHERE vsa.variantId = :variantId")
    void deleteByVariantId(@Param("variantId") Long variantId);
    
    @Query("SELECT DISTINCT vsa.attributeValue FROM VariantSearchAttribute vsa WHERE vsa.productId = :productId AND vsa.attributeName = :attributeName")
    List<String> findDistinctValuesByProductIdAndAttributeName(@Param("productId") Long productId, 
                                                              @Param("attributeName") String attributeName);
}