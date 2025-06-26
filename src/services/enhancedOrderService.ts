import { EnhancedOrder } from '../types';
import { mockEnhancedOrders } from '../data/mockEnhancedOrders';
import { BaseHybridService } from './baseService';

class EnhancedOrderService extends BaseHybridService {
  private orders: EnhancedOrder[] = [...mockEnhancedOrders];

  async getOrders(userId?: string, userRole?: string): Promise<EnhancedOrder[]> {
    const mockFallback = async () => {
      return new Promise<EnhancedOrder[]>((resolve) => {
        setTimeout(() => {
          let filteredOrders = [...this.orders];

          // Role-based filtering
          if (userRole === 'employee') {
            // Employee only sees their own orders
            filteredOrders = this.orders.filter(order => order.salesPerson.id === userId);
          }
          // Admin and Manager can see all orders

          resolve(filteredOrders);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedOrder[]>(
        `/orders?userId=${userId}&userRole=${userRole}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getOrderById(id: string, userId?: string, userRole?: string): Promise<EnhancedOrder | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === id);
        
        if (!order) {
          resolve(null);
          return;
        }

        // Check access permissions
        if (userRole === 'employee' && order.salesPerson.id !== userId) {
          resolve(null);
          return;
        }

        resolve(order);
      }, 300);
    });
  }

  async createOrder(orderData: Partial<EnhancedOrder>): Promise<EnhancedOrder> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder: EnhancedOrder = {
          id: `ORD-${Date.now().toString().slice(-3).padStart(3, '0')}`,
          customer: orderData.customer!,
          salesPerson: orderData.salesPerson!,
          status: orderData.status || 'draft',
          items: orderData.items || [],
          subtotal: orderData.subtotal || 0,
          discountAmount: orderData.discountAmount || 0,
          shippingFee: orderData.shippingFee || 0,
          total: orderData.total || 0,
          promotion: orderData.promotion,
          notes: orderData.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.orders.push(newOrder);
        resolve(newOrder);
      }, 800);
    });
  }

  async updateOrderStatus(
    id: string, 
    newStatus: EnhancedOrder['status'], 
    userId: string, 
    userRole: string
  ): Promise<EnhancedOrder | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === id);
        if (!order) {
          resolve(null);
          return;
        }

        // Check if user can update this status
        if (!this.canUpdateOrderStatus(order, newStatus, userRole)) {
          resolve(null);
          return;
        }

        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        resolve(order);
      }, 500);
    });
  }

  async searchOrders(query: string, userId?: string, userRole?: string): Promise<EnhancedOrder[]> {
    const orders = await this.getOrders(userId, userRole);
    
    return orders.filter(order =>
      order.id.toLowerCase().includes(query.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(query.toLowerCase()) ||
      order.customer.phone.includes(query)
    );
  }

  async getOrdersByStatus(status: string, userId?: string, userRole?: string): Promise<EnhancedOrder[]> {
    const orders = await this.getOrders(userId, userRole);
    return orders.filter(order => order.status === status);
  }

  async getOrderStats(userId?: string, userRole?: string): Promise<{
    total: number;
    draft: number;
    confirmed: number;
    preparing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> {
    const orders = await this.getOrders(userId, userRole);
    
    return {
      total: orders.length,
      draft: orders.filter(o => o.status === 'draft').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  }

  private canUpdateOrderStatus(
    order: EnhancedOrder,
    newStatus: EnhancedOrder['status'],
    userRole: string
  ): boolean {
    // Status transition rules
    const statusTransitions: Record<EnhancedOrder['status'], EnhancedOrder['status'][]> = {
      draft: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    const allowedNextStatuses = statusTransitions[order.status] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      return false;
    }

    // Role-based permissions for status changes
    switch (newStatus) {
      case 'confirmed':
      case 'cancelled':
        return userRole === 'admin' || userRole === 'manager';
      case 'preparing':
      case 'shipped':
        return userRole === 'admin' || userRole === 'employee' || userRole === 'manager';
      case 'delivered':
        return userRole === 'admin' || userRole === 'employee' || userRole === 'manager';
      default:
        return false;
    }
  }

  async confirmOrder(id: string, userId: string, userRole: string): Promise<EnhancedOrder | null> {
    if (userRole !== 'admin' && userRole !== 'manager') {
      throw new Error('Chỉ Admin và Manager mới có thể xác nhận đơn hàng');
    }
    return this.updateOrderStatus(id, 'confirmed', userId, userRole);
  }

  async cancelOrder(id: string, reason: string, userId: string, userRole: string): Promise<EnhancedOrder | null> {
    if (userRole !== 'admin' && userRole !== 'manager') {
      throw new Error('Chỉ Admin và Manager mới có thể hủy đơn hàng');
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === id);
        if (!order) {
          resolve(null);
          return;
        }

        order.status = 'cancelled';
        order.notes = (order.notes || '') + `\n[Hủy bởi ${userRole === 'admin' ? 'Admin' : 'Manager'}] Lý do: ${reason}`;
        order.updatedAt = new Date().toISOString();
        resolve(order);
      }, 500);
    });
  }

  async updateWorkflow(id: string, status: EnhancedOrder['status'], data?: any): Promise<EnhancedOrder | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === id);
        if (!order) {
          resolve(null);
          return;
        }

        order.status = status;
        order.updatedAt = new Date().toISOString();

        // Handle specific workflow data
        if (status === 'shipped' && data) {
          order.notes = (order.notes || '') + `\n[Xuất kho] Đơn vị vận chuyển: ${data.shippingProvider || 'N/A'}, Mã vận đơn: ${data.trackingCode || 'N/A'}`;
        }

        if (status === 'preparing' && data) {
          order.notes = (order.notes || '') + `\n[Chuẩn bị hàng] Bắt đầu chuẩn bị đơn hàng`;
        }

        resolve(order);
      }, 500);
    });
  }

  // Legacy methods for compatibility
  async getAll(): Promise<EnhancedOrder[]> {
    return this.getOrders();
  }

  async create(orderData: any): Promise<EnhancedOrder> {
    return this.createOrder(orderData);
  }

  async updateStatus(id: string, status: any): Promise<EnhancedOrder | null> {
    return this.updateOrderStatus(id, status, '', 'admin');
  }

  async cancel(id: string, reason: string): Promise<EnhancedOrder | null> {
    return this.cancelOrder(id, reason, '', 'admin');
  }
}

export const orderService = new EnhancedOrderService();
export const enhancedOrderService = new EnhancedOrderService();