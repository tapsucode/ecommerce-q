package com.inventorypro.service;

import com.inventorypro.model.Bundle;
import com.inventorypro.model.BundleItem;
import com.inventorypro.repository.BundleRepository;
import com.inventorypro.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * ADR 02: Bundle service for managing combo products
 * Stock calculation is done dynamically based on component products
 */
@Service
public class BundleService {

    @Autowired
    private BundleRepository bundleRepository;

    @Autowired
    private InventoryService inventoryService;

    /**
     * Calculate available stock for a bundle based on its components
     * The bundle stock is limited by the component with the lowest available stock
     */
    public Integer calculateBundleStock(Bundle bundle) {
        Integer minStock = Integer.MAX_VALUE;

        for (BundleItem item : bundle.getItems()) {
            Integer productStock = inventoryService.getTotalStockByProductId(item.getProduct().getId());
            Integer availableForBundle = productStock / item.getQuantity();
            minStock = Math.min(minStock, availableForBundle);
        }

        return minStock == Integer.MAX_VALUE ? 0 : minStock;
    }

    /**
     * Check if a bundle can be sold (has sufficient stock)
     */
    public boolean canSellBundle(Bundle bundle, Integer requestedQuantity) {
        Integer availableStock = calculateBundleStock(bundle);
        return availableStock >= requestedQuantity;
    }
}