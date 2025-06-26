package com.inventorypro.dto.request;

import jakarta.validation.constraints.NotNull;

public class StockAdjustmentRequest {
    
    @NotNull
    private Integer quantity;
    
    private String reason;
    
    // Constructors
    public StockAdjustmentRequest() {}
    
    // Getters and Setters
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}