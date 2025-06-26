package com.inventorypro.service.impl;

import com.inventorypro.dto.response.DashboardStatsResponse;
import com.inventorypro.model.Customer;
import com.inventorypro.model.Order;
import com.inventorypro.repository.*;
import com.inventorypro.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // Calculate total revenue (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        LocalDateTime now = LocalDateTime.now();
        BigDecimal totalRevenue = orderRepository.getTotalRevenueByDateRange(thirtyDaysAgo, now);
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        // Total orders count
        Long totalOrders = orderRepository.count();
        stats.setTotalOrders(totalOrders);

        // Total products count
        Long totalProducts = productRepository.count();
        stats.setTotalProducts(totalProducts);

        // Low stock items count
        Long lowStockItems = (long) inventoryItemRepository.findLowStockItems().size();
        stats.setLowStockItems(lowStockItems);

        stats.setCurrency("USD");

        return stats;
    }

    @Override
    public List<Map<String, Object>> getSalesData(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findOrdersByDateRange(startDate, endDate);

        // Group orders by month and calculate sales
        Map<String, BigDecimal> monthlySales = new HashMap<>();
        Map<String, Long> monthlyOrders = new HashMap<>();

        orders.forEach(order -> {
            String month = order.getCreatedAt().getMonth().toString();
            monthlySales.merge(month, order.getTotal(), BigDecimal::add);
            monthlyOrders.merge(month, 1L, Long::sum);
        });

        return monthlySales.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("month", entry.getKey());
                    data.put("sales", entry.getValue());
                    data.put("orders", monthlyOrders.get(entry.getKey()));
                    return data;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getTopSellingProducts(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> topProducts = orderItemRepository.getTopSellingProducts(startDate, endDate);

        return topProducts.stream()
                .map(result -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("productId", result[0]);
                    data.put("totalSold", result[1]);
                    return data;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getOrderStatusDistribution() {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getStatus().toString(),
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Long> getCustomerTypeDistribution() {
        List<Customer> customers = customerRepository.findAll();

        return customers.stream()
                .collect(Collectors.groupingBy(
                        customer -> customer.getCustomerType().toString(),
                        Collectors.counting()
                ));
    }
}