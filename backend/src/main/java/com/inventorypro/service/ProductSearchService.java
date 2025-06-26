package com.inventorypro.service;

import com.inventorypro.dto.request.ProductSearchRequest;
import com.inventorypro.dto.response.ProductSearchResponse;
import com.inventorypro.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * ADR 02: Enhanced Product Search Service
 * Implements faceted search and filtering capabilities
 */
public interface ProductSearchService {
    
    /**
     * ADR 02: Faceted search with filters
     * Hành động 6: Lọc sản phẩm ở Trang Danh mục (Faceted Search/Filtering)
     */
    ProductSearchResponse searchProducts(ProductSearchRequest request, Pageable pageable);
    
    /**
     * Get available filter options for a category
     */
    Map<String, List<String>> getAvailableFilters(Long categoryId);
    
    /**
     * Get available filter options for a product type
     */
    Map<String, List<String>> getAvailableFiltersByProductType(Long productTypeId);
    
    /**
     * Search products by text query
     */
    Page<Product> searchByText(String query, Pageable pageable);
    
    /**
     * Get product suggestions for autocomplete
     */
    List<String> getProductSuggestions(String query, int limit);
    
    /**
     * Get related products based on attributes
     */
    List<Product> getRelatedProducts(Long productId, int limit);
}