package com.inventorypro.service.impl;

import com.inventorypro.dto.request.StockAdjustmentRequest;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.model.InventoryItem;
import com.inventorypro.repository.InventoryItemRepository;
import com.inventorypro.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Override
    public InventoryItem createInventoryItem(InventoryItem inventoryItem) {
        return inventoryItemRepository.save(inventoryItem);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<InventoryItem> findById(Long id) {
        return inventoryItemRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<InventoryItem> findBySku(String sku) {
        return inventoryItemRepository.findBySku(sku);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItem> getAllInventoryItems() {
        return inventoryItemRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItem> getLowStockItems() {
        return inventoryItemRepository.findLowStockItems();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItem> getOutOfStockItems() {
        return inventoryItemRepository.findOutOfStockItems();
    }

    @Override
    public InventoryItem updateStock(Long id, StockAdjustmentRequest request) {
        InventoryItem inventoryItem = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));

        inventoryItem.setCurrentStock(request.getQuantity());
        return inventoryItemRepository.save(inventoryItem);
    }

    @Override
    public InventoryItem adjustStock(Long id, Integer adjustment) {
        InventoryItem inventoryItem = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));

        int newStock = inventoryItem.getCurrentStock() + adjustment;
        inventoryItem.setCurrentStock(Math.max(0, newStock));
        return inventoryItemRepository.save(inventoryItem);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getTotalStockByProductId(Long productId) {
        Integer totalStock = inventoryItemRepository.getTotalStockByProductId(productId);
        return totalStock != null ? totalStock : 0;
    }

    @Override
    public void deleteInventoryItem(Long id) {
        InventoryItem inventoryItem = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));

        inventoryItemRepository.delete(inventoryItem);
    }
}