package com.inventorypro.dto.response;

import java.math.BigDecimal;

public class DashboardStatsResponse {
    
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalProducts;
    private Long lowStockItems;
    private String currency;
    
    // Constructors
    public DashboardStatsResponse() {}
    
    // Getters and Setters
    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public Long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public Long getTotalProducts() {
        return totalProducts;
    }
    
    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }
    
    public Long getLowStockItems() {
        return lowStockItems;
    }
    
    public void setLowStockItems(Long lowStockItems) {
        this.lowStockItems = lowStockItems;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
}