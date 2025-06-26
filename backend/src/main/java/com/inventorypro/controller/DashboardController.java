package com.inventorypro.controller;

import com.inventorypro.dto.response.DashboardStatsResponse;
import com.inventorypro.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/sales-data")
    public ResponseEntity<List<Map<String, Object>>> getSalesData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Map<String, Object>> salesData = dashboardService.getSalesData(startDate, endDate);
        return ResponseEntity.ok(salesData);
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopSellingProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Map<String, Object>> topProducts = dashboardService.getTopSellingProducts(startDate, endDate);
        return ResponseEntity.ok(topProducts);
    }

    @GetMapping("/order-status-distribution")
    public ResponseEntity<Map<String, Long>> getOrderStatusDistribution() {
        Map<String, Long> distribution = dashboardService.getOrderStatusDistribution();
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/customer-type-distribution")
    public ResponseEntity<Map<String, Long>> getCustomerTypeDistribution() {
        Map<String, Long> distribution = dashboardService.getCustomerTypeDistribution();
        return ResponseEntity.ok(distribution);
    }
}