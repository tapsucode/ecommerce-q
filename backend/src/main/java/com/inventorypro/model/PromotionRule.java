package com.inventorypro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

/**
 * ADR 04: Flexible promotion rules stored as JSON
 * Examples:
 * - {"condition": "cart_total", "operator": ">=", "value": 100}
 * - {"condition": "product_category", "operator": "in", "value": ["electronics", "books"]}
 * - {"action": "discount_percentage", "value": 10}
 */
@Entity
@Table(name = "promotion_rules")
public class PromotionRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    @NotBlank
    @Column(name = "rule_type")
    private String ruleType; // "condition" or "action"

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rule_data", columnDefinition = "TEXT")
    private Map<String, Object> ruleData;

    @Column(name = "priority")
    private Integer priority = 0;

    // Constructors
    public PromotionRule() {}

    // Getters and Setters
    public Promotion getPromotion() {
        return promotion;
    }

    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
    }

    public String getRuleType() {
        return ruleType;
    }

    public void setRuleType(String ruleType) {
        this.ruleType = ruleType;
    }

    public Map<String, Object> getRuleData() {
        return ruleData;
    }

    public void setRuleData(Map<String, Object> ruleData) {
        this.ruleData = ruleData;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }
}