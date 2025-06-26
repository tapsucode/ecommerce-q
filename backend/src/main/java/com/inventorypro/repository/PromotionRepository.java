package com.inventorypro.repository;

import com.inventorypro.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    
    @Query("SELECT p FROM Promotion p WHERE p.active = true AND " +
           "(p.startDate IS NULL OR p.startDate <= :now) AND " +
           "(p.endDate IS NULL OR p.endDate >= :now) AND " +
           "(p.usageLimit IS NULL OR p.usageCount < p.usageLimit)")
    List<Promotion> findActivePromotions(@Param("now") LocalDateTime now);
}