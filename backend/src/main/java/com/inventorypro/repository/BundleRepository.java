package com.inventorypro.repository;

import com.inventorypro.model.Bundle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BundleRepository extends JpaRepository<Bundle, Long> {
    
    Optional<Bundle> findBySku(String sku);
    
    @Query("SELECT b FROM Bundle b WHERE b.active = true")
    List<Bundle> findAllActive();
    
    Boolean existsBySku(String sku);
}