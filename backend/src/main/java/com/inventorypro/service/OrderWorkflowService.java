package com.inventorypro.service;

import com.inventorypro.dto.request.OrderReturnRequest;
import com.inventorypro.dto.request.OrderShipmentRequest;
import com.inventorypro.model.Order;
import com.inventorypro.model.OrderReturn;

public interface OrderWorkflowService {
    
    Order confirmOrder(Long orderId);
    
    Order shipOrder(Long orderId, OrderShipmentRequest shipmentRequest);
    
    Order completeOrder(Long orderId);
    
    OrderReturn processReturn(Long orderId, OrderReturnRequest returnRequest);
    
    Order cancelOrder(Long orderId, String reason);
    
    boolean checkStockAvailability(Long orderId);
}