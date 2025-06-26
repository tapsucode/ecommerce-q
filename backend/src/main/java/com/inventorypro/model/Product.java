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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Enhanced Product model following ADR principles
 * ADR 01: UTF8MB4 support for multilingual data
 * ADR 02: JSONB attributes for flexible product properties
 * ADR 03: Separation of ProductType and Category
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String name;

    @NotBlank
    @Size(max = 100)
    @Column(name = "sku", unique = true)
    private String sku;

    @Column(name = "description", columnDefinition = "TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "cost", precision = 10, scale = 2)
    private BigDecimal cost;

    @NotBlank
    @Size(max = 3)
    @Column(name = "currency")
    private String currency;

    /**
     * ADR 03: Reference to ProductType for structure definition
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_type_id")
    private ProductType productType;

    /**
     * ADR 03: Reference to Category for display organization
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    /**
     * ADR 02: JSONB for flexible product attributes
     * Example: {"color": "Red", "size": "L", "material": "Cotton"}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes", columnDefinition = "TEXT")
    private Map<String, Object> attributes;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<InventoryItem> inventoryItems = new ArrayList<>();

    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;
}