package com.inventorypro.service;

import com.inventorypro.dto.response.DashboardStatsResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface DashboardService {
    
    DashboardStatsResponse getDashboardStats();
    
    List<Map<String, Object>> getSalesData(LocalDateTime startDate, LocalDateTime endDate);
    
    List<Map<String, Object>> getTopSellingProducts(LocalDateTime startDate, LocalDateTime endDate);
    
    Map<String, Long> getOrderStatusDistribution();
    
    Map<String, Long> getCustomerTypeDistribution();
}