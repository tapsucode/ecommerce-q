package com.inventorypro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Enhanced ProductVariant with JSONB attributes support
 * ADR 02: Flexible attribute storage for different product types
 */
@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant extends BaseEntity {

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String name;

    @NotBlank
    @Size(max = 100)
    @Column(name = "sku", unique = true)
    private String sku;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "cost", precision = 10, scale = 2)
    private BigDecimal cost;

    @NotNull
    @Column(name = "stock")
    @Builder.Default
    private Integer stock = 0;

    /**
     * ADR 02: JSONB for variant-specific attributes
     * Example: {"size": "L", "color": "Red"}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes", columnDefinition = "TEXT")
    private Map<String, Object> attributes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;
}