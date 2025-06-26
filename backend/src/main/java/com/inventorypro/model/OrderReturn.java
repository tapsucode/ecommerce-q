package com.inventorypro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_returns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderReturn extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @NotBlank
    @Size(max = 50)
    @Column(name = "return_number", unique = true)
    private String returnNumber;

    @NotNull
    @Column(name = "return_date")
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason")
    private ReturnReason reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition")
    private ReturnCondition condition;

    @Column(name = "notes", columnDefinition = "TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @OneToMany(mappedBy = "orderReturn", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderReturnItem> items = new ArrayList<>();

    public enum ReturnReason {
        DAMAGED, WRONG_ITEM, CUSTOMER_CHANGE_MIND, QUALITY_ISSUE, OTHER
    }

    public enum ReturnCondition {
        NEW, DAMAGED, USED
    }
}