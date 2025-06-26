package com.inventorypro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

/**
 * ADR 03: Product Type defines the structure and attributes for products
 * This is separate from Category which is used for display organization
 */
@Entity
@Table(name = "product_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductType extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", unique = true)
    private String name;

    @Size(max = 255)
    @Column(name = "description")
    private String description;

    /**
     * ADR 02: JSONB for flexible attribute definitions
     * Defines what attributes this product type should have
     * Example: {"size": {"type": "string", "required": true, "variant": true}, 
     *          "color": {"type": "string", "required": true, "variant": true}}
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attribute_definitions", columnDefinition = "TEXT")
    private Map<String, Object> attributeDefinitions;

    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;
}