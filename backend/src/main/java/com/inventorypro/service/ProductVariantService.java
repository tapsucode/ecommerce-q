package com.inventorypro.service;

import com.inventorypro.dto.request.ProductRequest;
import com.inventorypro.model.Product;
import com.inventorypro.model.ProductVariant;
import com.inventorypro.model.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing product variants with enhanced logic
 * Implements ADR 02: Dynamic variant generation and management
 */
public interface ProductVariantService {
    
    /**
     * ADR 02: Generate variants based on product type and attributes
     * Hành động 1: Tạo các Biến thể (Variant Generation)
     */
    List<ProductVariant> generateVariants(Product product, Map<String, Object> baseAttributes);
    
    /**
     * ADR 02: Validate variant data against product type definitions
     * Hành động 2: Validation Dữ liệu
     */
    boolean validateVariantAttributes(ProductVariant variant, ProductType productType);
    
    /**
     * ADR 02: Get all available options for a product (for PDP)
     * Hành động 3: Tổng hợp các Tùy chọn có sẵn (Aggregating Available Options)
     */
    Map<String, List<String>> getAvailableOptions(Long productId);
    
    /**
     * ADR 02: Map variant states (available, out of stock, etc.)
     * Hành động 4: Ánh xạ Trạng thái Biến thể (Mapping Variant States)
     */
    Map<String, Object> getVariantStates(Long productId);
    
    /**
     * ADR 02: Find variant by product and selected attributes
     * Hành động 5: Tìm kiếm Biến thể dựa trên Tùy chọn (Variant Lookup)
     */
    Optional<ProductVariant> findVariantByAttributes(Long productId, Map<String, String> selectedAttributes);
    
    /**
     * Standard CRUD operations
     */
    ProductVariant createVariant(ProductVariant variant);
    Optional<ProductVariant> findById(Long id);
    List<ProductVariant> findByProductId(Long productId);
    ProductVariant updateVariant(Long id, ProductVariant variant);
    void deleteVariant(Long id);
    
    /**
     * Bulk operations for efficiency
     */
    List<ProductVariant> createVariants(List<ProductVariant> variants);
    void updateVariantStock(Long variantId, Integer newStock);
    
    /**
     * Search and filtering support
     */
    Page<ProductVariant> searchVariants(String keyword, Pageable pageable);
    List<ProductVariant> findVariantsByAttributes(Map<String, String> attributes);
}