package com.inventorypro.dto.response;

import com.inventorypro.model.Product;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

/**
 * ADR 02: Enhanced Product Search Response
 * Includes faceted search results and filter options
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchResponse {
    
    private Page<Product> products;
    private Map<String, List<String>> availableFilters;
    private Map<String, Map<String, Long>> filterCounts;
    private long totalElements;
    private int totalPages;
    private int currentPage;
}