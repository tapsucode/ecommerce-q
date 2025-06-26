package com.inventorypro.controller;

import com.inventorypro.dto.request.ProductSearchRequest;
import com.inventorypro.dto.response.ProductSearchResponse;
import com.inventorypro.model.Product;
import com.inventorypro.service.ProductSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ADR 02: Enhanced Product Search Controller
 * Supports faceted search and filtering
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/product-search")
@RequiredArgsConstructor
public class ProductSearchController {

    private final ProductSearchService searchService;

    /**
     * ADR 02: Faceted search with filters
     * Hành động 6: Lọc sản phẩm ở Trang Danh mục
     */
    @PostMapping("/search")
    public ResponseEntity<ProductSearchResponse> searchProducts(
            @RequestBody ProductSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        ProductSearchResponse response = searchService.searchProducts(request, pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get available filters for a category
     */
    @GetMapping("/filters/category/{categoryId}")
    public ResponseEntity<Map<String, List<String>>> getFiltersForCategory(@PathVariable Long categoryId) {
        Map<String, List<String>> filters = searchService.getAvailableFilters(categoryId);
        return ResponseEntity.ok(filters);
    }

    /**
     * Get available filters for a product type
     */
    @GetMapping("/filters/product-type/{productTypeId}")
    public ResponseEntity<Map<String, List<String>>> getFiltersForProductType(@PathVariable Long productTypeId) {
        Map<String, List<String>> filters = searchService.getAvailableFiltersByProductType(productTypeId);
        return ResponseEntity.ok(filters);
    }

    /**
     * Simple text search
     */
    @GetMapping("/text")
    public ResponseEntity<Page<Product>> searchByText(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = searchService.searchByText(query, pageable);
        
        return ResponseEntity.ok(products);
    }

    /**
     * Get product suggestions for autocomplete
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getProductSuggestions(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {

        List<String> suggestions = searchService.getProductSuggestions(query, limit);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Get related products
     */
    @GetMapping("/related/{productId}")
    public ResponseEntity<List<Product>> getRelatedProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "8") int limit) {

        List<Product> relatedProducts = searchService.getRelatedProducts(productId, limit);
        return ResponseEntity.ok(relatedProducts);
    }
}