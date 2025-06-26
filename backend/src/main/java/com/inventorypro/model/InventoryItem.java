package com.inventorypro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @NotBlank
    @Size(max = 100)
    @Column(name = "sku")
    private String sku;

    @NotNull
    @Column(name = "current_stock")
    @Builder.Default
    private Integer currentStock = 0;

    @NotNull
    @Column(name = "reserved_stock")
    @Builder.Default
    private Integer reservedStock = 0;

    @NotNull
    @Column(name = "reorder_level")
    @Builder.Default
    private Integer reorderLevel = 10;

    @NotBlank
    @Size(max = 100)
    @Column(name = "warehouse")
    private String warehouse;

    @Size(max = 100)
    @Column(name = "location")
    private String location;

    // Computed property
    public Integer getAvailableStock() {
        return currentStock - reservedStock;
    }
}