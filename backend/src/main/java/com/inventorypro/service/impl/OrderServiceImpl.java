package com.inventorypro.service.impl;

import com.inventorypro.dto.request.OrderRequest;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.model.Customer;
import com.inventorypro.model.Order;
import com.inventorypro.model.OrderItem;
import com.inventorypro.model.Product;
import com.inventorypro.repository.CustomerRepository;
import com.inventorypro.repository.OrderRepository;
import com.inventorypro.repository.ProductRepository;
import com.inventorypro.service.OrderService;
import com.inventorypro.util.OrderNumberGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public Order createOrder(OrderRequest orderRequest) {
        Customer customer = customerRepository.findById(orderRequest.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", orderRequest.getCustomerId()));

        Order order = new Order();
        order.setOrderNumber(OrderNumberGenerator.generate());
        order.setCustomer(customer);
        order.setChannel(orderRequest.getChannel());
        order.setCurrency(orderRequest.getCurrency());
        order.setNotes(orderRequest.getNotes());

        List<OrderItem> orderItems = orderRequest.getItems().stream()
                .map(itemRequest -> {
                    Product product = productRepository.findById(itemRequest.getProductId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setProduct(product);
                    orderItem.setProductName(product.getName());
                    orderItem.setSku(product.getSku());
                    orderItem.setQuantity(itemRequest.getQuantity());
                    orderItem.setPrice(product.getPrice());
                    orderItem.setTotal(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

                    return orderItem;
                })
                .collect(Collectors.toList());

        order.setItems(orderItems);

        BigDecimal total = orderItems.stream()
                .map(OrderItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotal(total);

        Order savedOrder = orderRepository.save(order);

        // Update customer statistics
        customer.setTotalOrders(customer.getTotalOrders() + 1);
        customer.setTotalSpent(customer.getTotalSpent().add(total));
        customer.setLastOrderAt(LocalDateTime.now());
        customerRepository.save(customer);

        return savedOrder;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> searchOrders(String keyword, Pageable pageable) {
        return orderRepository.searchOrders(keyword, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findOrdersByDateRange(startDate, endDate);
    }

    @Override
    public Order updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalRevenueByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal revenue = orderRepository.getTotalRevenueByDateRange(startDate, endDate);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public Long getOrderCountByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.getOrderCountByDateRange(startDate, endDate);
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        orderRepository.delete(order);
    }
}