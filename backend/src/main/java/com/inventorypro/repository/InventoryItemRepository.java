package com.inventorypro.repository;

import com.inventorypro.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    
    Optional<InventoryItem> findBySku(String sku);
    
    List<InventoryItem> findByProductId(Long productId);
    
    List<InventoryItem> findByWarehouse(String warehouse);
    
    @Query("SELECT i FROM InventoryItem i WHERE (i.currentStock - i.reservedStock) <= i.reorderLevel")
    List<InventoryItem> findLowStockItems();
    
    @Query("SELECT i FROM InventoryItem i WHERE (i.currentStock - i.reservedStock) = 0")
    List<InventoryItem> findOutOfStockItems();
    
    @Query("SELECT SUM(i.currentStock) FROM InventoryItem i WHERE i.product.id = :productId")
    Integer getTotalStockByProductId(Long productId);
}