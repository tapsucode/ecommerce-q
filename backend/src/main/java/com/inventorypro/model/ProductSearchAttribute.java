package com.inventorypro.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * ADR 02: Product search attributes for faceted search
 * Supports Hành động 6: Lọc sản phẩm ở Trang Danh mục
 */
@Entity
@Table(name = "product_search_attributes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSearchAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "attribute_name", nullable = false, length = 100)
    private String attributeName;

    @Column(name = "attribute_value", nullable = false, columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String attributeValue;

    @Column(name = "searchable")
    @Builder.Default
    private Boolean searchable = true;

    @Column(name = "filterable")
    @Builder.Default
    private Boolean filterable = true;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
}