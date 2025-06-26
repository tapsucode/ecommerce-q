package com.inventorypro.service;

import com.inventorypro.dto.request.StockAdjustmentRequest;
import com.inventorypro.model.InventoryItem;

import java.util.List;
import java.util.Optional;

public interface InventoryService {
    
    InventoryItem createInventoryItem(InventoryItem inventoryItem);
    
    Optional<InventoryItem> findById(Long id);
    
    Optional<InventoryItem> findBySku(String sku);
    
    List<InventoryItem> getAllInventoryItems();
    
    List<InventoryItem> getLowStockItems();
    
    List<InventoryItem> getOutOfStockItems();
    
    InventoryItem updateStock(Long id, StockAdjustmentRequest request);
    
    InventoryItem adjustStock(Long id, Integer adjustment);
    
    Integer getTotalStockByProductId(Long productId);
    
    void deleteInventoryItem(Long id);
}