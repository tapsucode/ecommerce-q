package com.inventorypro.dto.request;

import com.inventorypro.model.Order;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class OrderRequest {
    
    @NotNull
    private Long customerId;
    
    private Order.OrderChannel channel;
    
    @NotNull
    private List<OrderItemRequest> items;
    
    @Size(max = 3)
    private String currency;
    
    private String notes;
    
    // Constructors
    public OrderRequest() {}
    
    // Getters and Setters
    public Long getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
    
    public Order.OrderChannel getChannel() {
        return channel;
    }
    
    public void setChannel(Order.OrderChannel channel) {
        this.channel = channel;
    }
    
    public List<OrderItemRequest> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}