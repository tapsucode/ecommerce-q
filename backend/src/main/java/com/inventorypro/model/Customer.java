package com.inventorypro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Enhanced Customer model with UTF8MB4 support for multilingual data
 * ADR 01: Proper encoding for international customer data
 */
@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String name;

    @NotBlank
    @Email
    @Size(max = 100)
    @Column(name = "email", unique = true)
    private String email;

    @Size(max = 20)
    @Column(name = "phone")
    private String phone;

    @Column(name = "address", columnDefinition = "TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String address;

    @Size(max = 100)
    @Column(name = "country", columnDefinition = "VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String country;

    @Size(max = 100)
    @Column(name = "city", columnDefinition = "VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String city;

    @Size(max = 20)
    @Column(name = "postal_code")
    private String postalCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type")
    @Builder.Default
    private CustomerType customerType = CustomerType.RETAIL;

    @Column(name = "total_orders")
    @Builder.Default
    private Integer totalOrders = 0;

    @Column(name = "total_spent", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Size(max = 3)
    @Column(name = "currency")
    @Builder.Default
    private String currency = "USD";

    @Column(name = "last_order_at")
    private LocalDateTime lastOrderAt;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @Column(name = "active")
    @Builder.Default
    private Boolean active = true;

    public enum CustomerType {
        RETAIL, WHOLESALE
    }
}