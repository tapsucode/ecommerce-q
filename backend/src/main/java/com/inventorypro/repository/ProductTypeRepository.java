package com.inventorypro.repository;

import com.inventorypro.model.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {
    
    Optional<ProductType> findByName(String name);
    
    @Query("SELECT pt FROM ProductType pt WHERE pt.active = true ORDER BY pt.name")
    List<ProductType> findAllActive();
    
    Boolean existsByName(String name);
}