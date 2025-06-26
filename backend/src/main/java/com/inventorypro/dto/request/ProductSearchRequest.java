package com.inventorypro.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * ADR 02: Enhanced Product Search Request
 * Supports faceted search and filtering
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchRequest {
    
    private String keyword;
    private Long categoryId;
    private Long productTypeId;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private Map<String, String> attributes;
    private Boolean inStock;
    private String sortBy;
    private String sortDirection;
}