package com.inventorypro.dto.request;

import com.inventorypro.model.OrderReturn;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderReturnRequest {
    
    @NotNull
    private OrderReturn.ReturnReason reason;
    
    @NotNull
    private OrderReturn.ReturnCondition condition;
    
    private String notes;
    
    private List<ReturnItemRequest> items;
    
    @Data
    public static class ReturnItemRequest {
        private Long orderItemId;
        private Long productId;
        private Long variantId;
        private Integer quantity;
        private OrderReturn.ReturnCondition condition;
        private Boolean restock;
    }
}