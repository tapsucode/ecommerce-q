package com.inventorypro.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderShipmentRequest {
    
    @NotBlank
    private String trackingCode;
    
    @NotBlank
    private String shippingProvider;
    
    private BigDecimal shippingFee;
    
    private String notes;
}