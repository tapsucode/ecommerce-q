package com.inventorypro.service;

import com.inventorypro.model.Order;
import com.inventorypro.model.Promotion;
import com.inventorypro.model.PromotionRule;
import com.inventorypro.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * ADR 04: Centralized Promotion Engine
 * Rule-based system that processes promotions dynamically
 */
@Service
public class PromotionEngine {

    @Autowired
    private PromotionRepository promotionRepository;

    public BigDecimal calculateDiscount(Order order) {
        List<Promotion> activePromotions = promotionRepository.findActivePromotions(LocalDateTime.now());
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (Promotion promotion : activePromotions) {
            if (isPromotionApplicable(promotion, order)) {
                BigDecimal discount = applyPromotion(promotion, order);
                totalDiscount = totalDiscount.add(discount);
            }
        }

        return totalDiscount;
    }

    private boolean isPromotionApplicable(Promotion promotion, Order order) {
        for (PromotionRule rule : promotion.getRules()) {
            if ("condition".equals(rule.getRuleType())) {
                if (!evaluateCondition(rule.getRuleData(), order)) {
                    return false;
                }
            }
        }
        return true;
    }

    private boolean evaluateCondition(Map<String, Object> ruleData, Order order) {
        String condition = (String) ruleData.get("condition");
        String operator = (String) ruleData.get("operator");
        Object value = ruleData.get("value");

        switch (condition) {
            case "cart_total":
                return evaluateNumericCondition(order.getTotal(), operator, value);
            case "item_count":
                int itemCount = order.getItems().stream()
                    .mapToInt(item -> item.getQuantity())
                    .sum();
                return evaluateNumericCondition(BigDecimal.valueOf(itemCount), operator, value);
            case "customer_type":
                return evaluateStringCondition(order.getCustomer().getCustomerType().toString(), operator, value);
            // Add more conditions as needed
            default:
                return false;
        }
    }

    private boolean evaluateNumericCondition(BigDecimal actual, String operator, Object value) {
        BigDecimal expectedValue = new BigDecimal(value.toString());
        switch (operator) {
            case ">=": return actual.compareTo(expectedValue) >= 0;
            case ">": return actual.compareTo(expectedValue) > 0;
            case "<=": return actual.compareTo(expectedValue) <= 0;
            case "<": return actual.compareTo(expectedValue) < 0;
            case "==": return actual.compareTo(expectedValue) == 0;
            default: return false;
        }
    }

    private boolean evaluateStringCondition(String actual, String operator, Object value) {
        switch (operator) {
            case "==": return actual.equals(value.toString());
            case "!=": return !actual.equals(value.toString());
            case "in": 
                if (value instanceof List) {
                    return ((List<?>) value).contains(actual);
                }
                return false;
            default: return false;
        }
    }

    private BigDecimal applyPromotion(Promotion promotion, Order order) {
        for (PromotionRule rule : promotion.getRules()) {
            if ("action".equals(rule.getRuleType())) {
                return executeAction(rule.getRuleData(), order);
            }
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal executeAction(Map<String, Object> ruleData, Order order) {
        String action = (String) ruleData.get("action");
        Object value = ruleData.get("value");

        switch (action) {
            case "discount_percentage":
                double percentage = Double.parseDouble(value.toString());
                return order.getTotal().multiply(BigDecimal.valueOf(percentage / 100));
            case "discount_fixed":
                return new BigDecimal(value.toString());
            // Add more actions as needed
            default:
                return BigDecimal.ZERO;
        }
    }
}