package com.inventorypro.service.impl;

import com.inventorypro.dto.request.ProductSearchRequest;
import com.inventorypro.dto.response.ProductSearchResponse;
import com.inventorypro.model.Product;
import com.inventorypro.repository.ProductRepository;
import com.inventorypro.repository.ProductSearchAttributeRepository;
import com.inventorypro.service.ProductSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * ADR 02: Enhanced Product Search Service Implementation
 * Implements faceted search and filtering capabilities
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class ProductSearchServiceImpl implements ProductSearchService {

    private final ProductRepository productRepository;
    private final ProductSearchAttributeRepository searchAttributeRepository;

    /**
     * ADR 02: Faceted search with filters
     * Hành động 6: Lọc sản phẩm ở Trang Danh mục (Faceted Search/Filtering)
     */
    @Override
    public ProductSearchResponse searchProducts(ProductSearchRequest request, Pageable pageable) {
        log.info("Searching products with request: {}", request);
        
        // Build dynamic query based on filters
        Page<Product> products = productRepository.searchWithFilters(
            request.getKeyword(),
            request.getCategoryId(),
            request.getProductTypeId(),
            request.getPriceMin(),
            request.getPriceMax(),
            request.getAttributes(),
            request.getInStock(),
            pageable
        );
        
        // Get available filters for the current search context
        Map<String, List<String>> availableFilters = getAvailableFiltersForSearch(request);
        
        // Get filter counts
        Map<String, Map<String, Long>> filterCounts = getFilterCounts(request);
        
        return ProductSearchResponse.builder()
            .products(products)
            .availableFilters(availableFilters)
            .filterCounts(filterCounts)
            .totalElements(products.getTotalElements())
            .totalPages(products.getTotalPages())
            .currentPage(products.getNumber())
            .build();
    }

    @Override
    public Map<String, List<String>> getAvailableFilters(Long categoryId) {
        log.info("Getting available filters for category: {}", categoryId);
        
        List<Object[]> filterData = searchAttributeRepository.findFiltersByCategoryId(categoryId);
        return groupFilterData(filterData);
    }

    @Override
    public Map<String, List<String>> getAvailableFiltersByProductType(Long productTypeId) {
        log.info("Getting available filters for product type: {}", productTypeId);
        
        List<Object[]> filterData = searchAttributeRepository.findFiltersByProductTypeId(productTypeId);
        return groupFilterData(filterData);
    }

    @Override
    public Page<Product> searchByText(String query, Pageable pageable) {
        log.info("Searching products by text: {}", query);
        
        if (query == null || query.trim().isEmpty()) {
            return productRepository.findAllActiveProducts(pageable);
        }
        
        return productRepository.searchByText(query.trim(), pageable);
    }

    @Override
    public List<String> getProductSuggestions(String query, int limit) {
        log.info("Getting product suggestions for query: {}", query);
        
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        return productRepository.findProductSuggestions(query.trim(), limit);
    }

    @Override
    public List<Product> getRelatedProducts(Long productId, int limit) {
        log.info("Getting related products for product: {}", productId);
        
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return Collections.emptyList();
        }
        
        // Find products with similar attributes or in the same category
        return productRepository.findRelatedProducts(
            productId,
            product.getCategory().getId(),
            product.getProductType().getId(),
            limit
        );
    }

    // =====================================================
    // PRIVATE HELPER METHODS
    // =====================================================

    private Map<String, List<String>> getAvailableFiltersForSearch(ProductSearchRequest request) {
        // Get filters based on current search context
        List<Object[]> filterData;
        
        if (request.getCategoryId() != null) {
            filterData = searchAttributeRepository.findFiltersForSearchContext(
                request.getKeyword(),
                request.getCategoryId(),
                request.getProductTypeId(),
                request.getAttributes()
            );
        } else {
            filterData = searchAttributeRepository.findAllAvailableFilters();
        }
        
        return groupFilterData(filterData);
    }

    private Map<String, Map<String, Long>> getFilterCounts(ProductSearchRequest request) {
        Map<String, Map<String, Long>> filterCounts = new HashMap<>();
        
        // Get counts for each filter option
        List<Object[]> countData = searchAttributeRepository.getFilterCounts(
            request.getKeyword(),
            request.getCategoryId(),
            request.getProductTypeId(),
            request.getAttributes()
        );
        
        for (Object[] row : countData) {
            String attributeName = (String) row[0];
            String attributeValue = (String) row[1];
            Long count = (Long) row[2];
            
            filterCounts.computeIfAbsent(attributeName, k -> new HashMap<>())
                       .put(attributeValue, count);
        }
        
        return filterCounts;
    }

    private Map<String, List<String>> groupFilterData(List<Object[]> filterData) {
        Map<String, Set<String>> filtersMap = new HashMap<>();
        
        for (Object[] row : filterData) {
            String attributeName = (String) row[0];
            String attributeValue = (String) row[1];
            
            filtersMap.computeIfAbsent(attributeName, k -> new HashSet<>())
                     .add(attributeValue);
        }
        
        // Convert to sorted lists
        Map<String, List<String>> result = new HashMap<>();
        for (Map.Entry<String, Set<String>> entry : filtersMap.entrySet()) {
            List<String> sortedValues = new ArrayList<>(entry.getValue());
            Collections.sort(sortedValues);
            result.put(entry.getKey(), sortedValues);
        }
        
        return result;
    }
}