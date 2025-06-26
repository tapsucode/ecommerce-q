package com.inventorypro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * ADR 02: Bundle management for combo products
 * Stock is calculated dynamically based on component products
 */
@Entity
@Table(name = "bundles")
public class Bundle extends BaseEntity {

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

    @NotBlank
    @Size(max = 3)
    @Column(name = "currency")
    private String currency;

    @OneToMany(mappedBy = "bundle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BundleItem> items = new ArrayList<>();

    @Column(name = "active")
    private Boolean active = true;

    // Constructors
    public Bundle() {}

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public List<BundleItem> getItems() {
        return items;
    }

    public void setItems(List<BundleItem> items) {
        this.items = items;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}