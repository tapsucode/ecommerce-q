package com.inventorypro.service;

import com.inventorypro.dto.request.OrderRequest;
import com.inventorypro.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    
    Order createOrder(OrderRequest orderRequest);
    
    Optional<Order> findById(Long id);
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> getAllOrders();
    
    Page<Order> searchOrders(String keyword, Pageable pageable);
    
    List<Order> getOrdersByStatus(Order.OrderStatus status);
    
    List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    Order updateOrderStatus(Long id, Order.OrderStatus status);
    
    BigDecimal getTotalRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    Long getOrderCountByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    void deleteOrder(Long id);
}