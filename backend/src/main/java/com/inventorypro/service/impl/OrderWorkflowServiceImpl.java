package com.inventorypro.service.impl;

import com.inventorypro.dto.request.OrderReturnRequest;
import com.inventorypro.dto.request.OrderShipmentRequest;
import com.inventorypro.exception.ResourceNotFoundException;
import com.inventorypro.model.*;
import com.inventorypro.repository.*;
import com.inventorypro.service.OrderWorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OrderWorkflowServiceImpl implements OrderWorkflowService {

    private final OrderRepository orderRepository;
    private final OrderReturnRepository orderReturnRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final StockMovementRepository stockMovementRepository;

    @Override
    public Order confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalStateException("Order must be in PENDING status to confirm");
        }

        // Check stock availability
        if (!checkStockAvailability(orderId)) {
            throw new IllegalStateException("Insufficient stock for order confirmation");
        }

        // Reserve stock for order items
        reserveStockForOrder(order);

        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @Override
    public Order shipOrder(Long orderId, OrderShipmentRequest shipmentRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Order must be in CONFIRMED status to ship");
        }

        // Update shipping information
        order.setTrackingCode(shipmentRequest.getTrackingCode());
        order.setShippingProvider(shipmentRequest.getShippingProvider());
        order.setShippingFee(shipmentRequest.getShippingFee());
        order.setStatus(Order.OrderStatus.SHIPPED);
        order.setShippedAt(LocalDateTime.now());

        // Process stock movements (OUT)
        processOrderShipment(order);

        return orderRepository.save(order);
    }

    @Override
    public Order completeOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != Order.OrderStatus.SHIPPED) {
            throw new IllegalStateException("Order must be in SHIPPED status to complete");
        }

        order.setStatus(Order.OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @Override
    public OrderReturn processReturn(Long orderId, OrderReturnRequest returnRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() != Order.OrderStatus.SHIPPED && order.getStatus() != Order.OrderStatus.COMPLETED) {
            throw new IllegalStateException("Order must be SHIPPED or COMPLETED to process return");
        }

        // Create return record
        OrderReturn orderReturn = OrderReturn.builder()
                .order(order)
                .returnNumber(generateReturnNumber())
                .returnDate(LocalDate.now())
                .reason(returnRequest.getReason())
                .condition(returnRequest.getCondition())
                .notes(returnRequest.getNotes())
                .build();

        orderReturn = orderReturnRepository.save(orderReturn);

        // Process return items and restock if applicable
        processReturnItems(orderReturn, returnRequest);

        // Update order status
        order.setStatus(Order.OrderStatus.RETURNED);
        orderRepository.save(order);

        return orderReturn;
    }

    @Override
    public Order cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel shipped or completed orders");
        }

        // Release reserved stock if order was confirmed
        if (order.getStatus() == Order.OrderStatus.CONFIRMED) {
            releaseReservedStock(order);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setNotes(order.getNotes() + "\nCancellation reason: " + reason);

        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkStockAvailability(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        for (OrderItem item : order.getItems()) {
            List<InventoryItem> inventoryItems;
            
            if (item.getVariant() != null) {
                inventoryItems = inventoryItemRepository.findByVariantId(item.getVariant().getId());
            } else {
                inventoryItems = inventoryItemRepository.findByProductId(item.getProduct().getId());
            }

            int totalAvailableStock = inventoryItems.stream()
                    .mapToInt(inv -> inv.getCurrentStock() - inv.getReservedStock())
                    .sum();

            if (totalAvailableStock < item.getQuantity()) {
                log.warn("Insufficient stock for item: {} (Required: {}, Available: {})", 
                        item.getProductName(), item.getQuantity(), totalAvailableStock);
                return false;
            }
        }

        return true;
    }

    private void reserveStockForOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            List<InventoryItem> inventoryItems;
            
            if (item.getVariant() != null) {
                inventoryItems = inventoryItemRepository.findByVariantId(item.getVariant().getId());
            } else {
                inventoryItems = inventoryItemRepository.findByProductId(item.getProduct().getId());
            }

            int remainingToReserve = item.getQuantity();
            
            for (InventoryItem inventoryItem : inventoryItems) {
                if (remainingToReserve <= 0) break;

                int availableStock = inventoryItem.getCurrentStock() - inventoryItem.getReservedStock();
                int toReserve = Math.min(remainingToReserve, availableStock);

                if (toReserve > 0) {
                    // Create stock movement for reservation
                    StockMovement movement = StockMovement.builder()
                            .inventoryItem(inventoryItem)
                            .movementType(StockMovement.MovementType.RESERVED)
                            .quantity(toReserve)
                            .previousStock(inventoryItem.getReservedStock())
                            .newStock(inventoryItem.getReservedStock() + toReserve)
                            .reason("Order confirmation - Reserved for order " + order.getOrderNumber())
                            .referenceType(StockMovement.ReferenceType.ORDER)
                            .referenceId(order.getId())
                            .build();

                    stockMovementRepository.save(movement);

                    // Update reserved stock
                    inventoryItem.setReservedStock(inventoryItem.getReservedStock() + toReserve);
                    inventoryItemRepository.save(inventoryItem);

                    remainingToReserve -= toReserve;
                }
            }
        }
    }

    private void processOrderShipment(Order order) {
        for (OrderItem item : order.getItems()) {
            List<InventoryItem> inventoryItems;
            
            if (item.getVariant() != null) {
                inventoryItems = inventoryItemRepository.findByVariantId(item.getVariant().getId());
            } else {
                inventoryItems = inventoryItemRepository.findByProductId(item.getProduct().getId());
            }

            int remainingToShip = item.getQuantity();
            
            for (InventoryItem inventoryItem : inventoryItems) {
                if (remainingToShip <= 0) break;

                int reservedStock = inventoryItem.getReservedStock();
                int toShip = Math.min(remainingToShip, reservedStock);

                if (toShip > 0) {
                    // Create stock movement for shipment
                    StockMovement movement = StockMovement.builder()
                            .inventoryItem(inventoryItem)
                            .movementType(StockMovement.MovementType.OUT)
                            .quantity(-toShip)
                            .previousStock(inventoryItem.getCurrentStock())
                            .newStock(inventoryItem.getCurrentStock() - toShip)
                            .reason("Order shipment - " + order.getOrderNumber())
                            .referenceType(StockMovement.ReferenceType.ORDER)
                            .referenceId(order.getId())
                            .build();

                    stockMovementRepository.save(movement);

                    // Update inventory
                    inventoryItem.setCurrentStock(inventoryItem.getCurrentStock() - toShip);
                    inventoryItem.setReservedStock(inventoryItem.getReservedStock() - toShip);
                    inventoryItemRepository.save(inventoryItem);

                    remainingToShip -= toShip;
                }
            }
        }
    }

    private void releaseReservedStock(Order order) {
        for (OrderItem item : order.getItems()) {
            List<InventoryItem> inventoryItems;
            
            if (item.getVariant() != null) {
                inventoryItems = inventoryItemRepository.findByVariantId(item.getVariant().getId());
            } else {
                inventoryItems = inventoryItemRepository.findByProductId(item.getProduct().getId());
            }

            int remainingToRelease = item.getQuantity();
            
            for (InventoryItem inventoryItem : inventoryItems) {
                if (remainingToRelease <= 0) break;

                int reservedStock = inventoryItem.getReservedStock();
                int toRelease = Math.min(remainingToRelease, reservedStock);

                if (toRelease > 0) {
                    // Create stock movement for release
                    StockMovement movement = StockMovement.builder()
                            .inventoryItem(inventoryItem)
                            .movementType(StockMovement.MovementType.RELEASED)
                            .quantity(toRelease)
                            .previousStock(inventoryItem.getReservedStock())
                            .newStock(inventoryItem.getReservedStock() - toRelease)
                            .reason("Order cancellation - Released from order " + order.getOrderNumber())
                            .referenceType(StockMovement.ReferenceType.ORDER)
                            .referenceId(order.getId())
                            .build();

                    stockMovementRepository.save(movement);

                    // Update reserved stock
                    inventoryItem.setReservedStock(inventoryItem.getReservedStock() - toRelease);
                    inventoryItemRepository.save(inventoryItem);

                    remainingToRelease -= toRelease;
                }
            }
        }
    }

    private void processReturnItems(OrderReturn orderReturn, OrderReturnRequest returnRequest) {
        // Implementation for processing return items and restocking
        // This would involve creating OrderReturnItem records and updating inventory
        // Based on the return request details
    }

    private String generateReturnNumber() {
        // Simple return number generation - in production, use a more sophisticated approach
        return "RET-" + System.currentTimeMillis();
    }
}