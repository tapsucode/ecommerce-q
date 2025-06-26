package com.inventorypro.controller;

import com.inventorypro.dto.request.OrderReturnRequest;
import com.inventorypro.dto.request.OrderShipmentRequest;
import com.inventorypro.model.Order;
import com.inventorypro.model.OrderReturn;
import com.inventorypro.service.OrderWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/order-workflow")
@RequiredArgsConstructor
public class OrderWorkflowController {

    private final OrderWorkflowService orderWorkflowService;

    @PostMapping("/{orderId}/confirm")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Order> confirmOrder(@PathVariable Long orderId) {
        Order order = orderWorkflowService.confirmOrder(orderId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/ship")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('EMPLOYEE')")
    public ResponseEntity<Order> shipOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderShipmentRequest shipmentRequest) {
        Order order = orderWorkflowService.shipOrder(orderId, shipmentRequest);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/complete")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Order> completeOrder(@PathVariable Long orderId) {
        Order order = orderWorkflowService.completeOrder(orderId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderId}/return")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('EMPLOYEE')")
    public ResponseEntity<OrderReturn> processReturn(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderReturnRequest returnRequest) {
        OrderReturn orderReturn = orderWorkflowService.processReturn(orderId, returnRequest);
        return ResponseEntity.ok(orderReturn);
    }

    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam String reason) {
        Order order = orderWorkflowService.cancelOrder(orderId, reason);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{orderId}/check-stock")
    public ResponseEntity<Boolean> checkStockAvailability(@PathVariable Long orderId) {
        boolean available = orderWorkflowService.checkStockAvailability(orderId);
        return ResponseEntity.ok(available);
    }
}