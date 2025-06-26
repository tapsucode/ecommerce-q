package com.inventorypro.controller;

import com.inventorypro.dto.request.StockAdjustmentRequest;
import com.inventorypro.model.InventoryItem;
import com.inventorypro.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryItem>> getAllInventoryItems() {
        List<InventoryItem> items = inventoryService.getAllInventoryItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItem>> getLowStockItems() {
        List<InventoryItem> items = inventoryService.getLowStockItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<InventoryItem>> getOutOfStockItems() {
        List<InventoryItem> items = inventoryService.getOutOfStockItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItem> getInventoryItemById(@PathVariable Long id) {
        return inventoryService.findById(id)
                .map(item -> ResponseEntity.ok().body(item))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<InventoryItem> getInventoryItemBySku(@PathVariable String sku) {
        return inventoryService.findBySku(sku)
                .map(item -> ResponseEntity.ok().body(item))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryItem> updateStock(@PathVariable Long id,
                                                   @Valid @RequestBody StockAdjustmentRequest request) {
        InventoryItem item = inventoryService.updateStock(id, request);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{id}/adjust")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('EMPLOYEE')")
    public ResponseEntity<InventoryItem> adjustStock(@PathVariable Long id,
                                                   @RequestParam Integer adjustment) {
        InventoryItem item = inventoryService.adjustStock(id, adjustment);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/product/{productId}/total-stock")
    public ResponseEntity<Integer> getTotalStockByProductId(@PathVariable Long productId) {
        Integer totalStock = inventoryService.getTotalStockByProductId(productId);
        return ResponseEntity.ok(totalStock);
    }
}