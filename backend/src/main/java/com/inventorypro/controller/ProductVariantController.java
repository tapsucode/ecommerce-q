package com.inventorypro.controller;

import com.inventorypro.model.ProductVariant;
import com.inventorypro.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * ADR 02: Enhanced Product Variant Controller
 * Supports dynamic variant management and lookup
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/product-variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;

    /**
     * ADR 02: Get available options for a product (for PDP)
     * Hành động 3: Tổng hợp các Tùy chọn có sẵn
     */
    @GetMapping("/product/{productId}/options")
    public ResponseEntity<Map<String, List<String>>> getAvailableOptions(@PathVariable Long productId) {
        Map<String, List<String>> options = variantService.getAvailableOptions(productId);
        return ResponseEntity.ok(options);
    }

    /**
     * ADR 02: Get variant states for a product
     * Hành động 4: Ánh xạ Trạng thái Biến thể
     */
    @GetMapping("/product/{productId}/states")
    public ResponseEntity<Map<String, Object>> getVariantStates(@PathVariable Long productId) {
        Map<String, Object> states = variantService.getVariantStates(productId);
        return ResponseEntity.ok(states);
    }

    /**
     * ADR 02: Find variant by selected attributes
     * Hành động 5: Tìm kiếm Biến thể dựa trên Tùy chọn
     */
    @PostMapping("/product/{productId}/find")
    public ResponseEntity<ProductVariant> findVariantByAttributes(
            @PathVariable Long productId,
            @RequestBody Map<String, String> selectedAttributes) {
        
        Optional<ProductVariant> variant = variantService.findVariantByAttributes(productId, selectedAttributes);
        return variant.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all variants for a product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVariant>> getVariantsByProduct(@PathVariable Long productId) {
        List<ProductVariant> variants = variantService.findByProductId(productId);
        return ResponseEntity.ok(variants);
    }

    /**
     * Get variant by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductVariant> getVariantById(@PathVariable Long id) {
        return variantService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new variant
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ProductVariant> createVariant(@RequestBody ProductVariant variant) {
        ProductVariant createdVariant = variantService.createVariant(variant);
        return ResponseEntity.ok(createdVariant);
    }

    /**
     * Update variant
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ProductVariant> updateVariant(@PathVariable Long id, @RequestBody ProductVariant variant) {
        ProductVariant updatedVariant = variantService.updateVariant(id, variant);
        return ResponseEntity.ok(updatedVariant);
    }

    /**
     * Update variant stock
     */
    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('EMPLOYEE')")
    public ResponseEntity<Void> updateVariantStock(@PathVariable Long id, @RequestParam Integer stock) {
        variantService.updateVariantStock(id, stock);
        return ResponseEntity.ok().build();
    }

    /**
     * Delete variant (soft delete)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVariant(@PathVariable Long id) {
        variantService.deleteVariant(id);
        return ResponseEntity.ok().build();
    }
}