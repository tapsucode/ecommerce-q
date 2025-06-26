import { EnhancedOrder, EnhancedCustomer, EnhancedPromotion, User } from '../types';

// Enhanced mock data with role-based features
const mockEnhancedOrders: EnhancedOrder[] = [
  {
    id: '1',
    customer: {
      id: '1',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    salesPerson: {
      id: '2',
      username: 'sales1',
      email: 'sales1@company.com',
      fullName: 'Trần Thị Sales',
      phone: '0907654321',
      role: 'salesperson',
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    status: 'confirmed',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Áo thun cotton',
        sku: 'SHIRT-001',
        quantity: 2,
        price: 150000,
        total: 300000,
      },
    ],
    subtotal: 300000,
    discountAmount: 30000,
    shippingFee: 30000,
    total: 300000,
    promotion: {
      id: '1',
      name: 'Giảm 10% đơn hàng trên 250k',
      type: 'percentage',
      value: 10,
      minOrderAmount: 250000,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    notes: 'Giao hàng buổi chiều',
    confirmedAt: '2024-01-15T11:00:00Z',
    confirmedBy: {
      id: '1',
      username: 'manager1',
      email: 'manager@company.com',
      fullName: 'Nguyễn Văn Manager',
      phone: '0901234567',
      role: 'manager',
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '2',
    customer: {
      id: '2',
      name: 'Trần Thị B',
      phone: '0907654321',
      email: 'tranthib@email.com',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    salesPerson: {
      id: '2',
      username: 'sales1',
      email: 'sales1@company.com',
      fullName: 'Trần Thị Sales',
      phone: '0907654321',
      role: 'salesperson',
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    status: 'draft',
    items: [
      {
        id: '2',
        productId: '2',
        productName: 'Quần jeans',
        sku: 'JEANS-001',
        quantity: 1,
        price: 200000,
        total: 200000,
      },
    ],
    subtotal: 200000,
    discountAmount: 0,
    shippingFee: 0,
    total: 200000,
    promotion: {
      id: '2',
      name: 'Miễn phí vận chuyển',
      type: 'free_shipping',
      value: 0,
      minOrderAmount: 150000,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
  },
];

class EnhancedOrderService {
  private orders: EnhancedOrder[] = mockEnhancedOrders;

  async getOrders(userId?: string, userRole?: string): Promise<EnhancedOrder[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredOrders = this.orders;
        
        // Filter orders based on user role
        if (userRole === 'salesperson' && userId) {
          filteredOrders = this.orders.filter(order => 
            order.salesPerson.id === userId
          );
        }
        // Manager and warehouse can see all orders
        
        resolve(filteredOrders);
      }, 400);
    });
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
        if (userRole === 'salesperson' && userId && order.salesPerson.id !== userId) {
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
          id: Date.now().toString(),
          customer: orderData.customer!,
          salesPerson: orderData.salesPerson!,
          status: 'draft',
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
    status: EnhancedOrder['status'], 
    userId?: string,
    userRole?: string
  ): Promise<EnhancedOrder | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === id);
        if (!order) {
          resolve(null);
          return;
        }

        // Check permissions for status updates
        const canUpdate = this.canUpdateOrderStatus(order, status, userRole);
        if (!canUpdate) {
          resolve(null);
          return;
        }

        order.status = status;
        order.updatedAt = new Date().toISOString();

        // Set confirmation details for manager confirmations
        if (status === 'confirmed' && userRole === 'manager' && userId) {
          order.confirmedAt = new Date().toISOString();
          // In real app, would fetch user details
          order.confirmedBy = mockEnhancedOrders[0].confirmedBy; // Mock manager
        }

        resolve(order);
      }, 500);
    });
  }

  async searchOrders(query: string, userId?: string, userRole?: string): Promise<EnhancedOrder[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let orders = this.orders;
        
        // Apply role-based filtering first
        if (userRole === 'salesperson' && userId) {
          orders = orders.filter(order => order.salesPerson.id === userId);
        }
        
        // Then apply search filter
        const filtered = orders.filter(order =>
          order.customer.name.toLowerCase().includes(query.toLowerCase()) ||
          order.customer.phone.includes(query) ||
          order.status.toLowerCase().includes(query.toLowerCase()) ||
          order.id.includes(query)
        );
        
        resolve(filtered);
      }, 400);
    });
  }

  async getOrdersByStatus(status: string, userId?: string, userRole?: string): Promise<EnhancedOrder[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let orders = this.orders;
        
        // Apply role-based filtering first
        if (userRole === 'salesperson' && userId) {
          orders = orders.filter(order => order.salesPerson.id === userId);
        }
        
        // Filter by status
        const filtered = orders.filter(order => order.status === status);
        resolve(filtered);
      }, 400);
    });
  }

  async getOrderStats(userId?: string, userRole?: string): Promise<{
    totalOrders: number;
    draftOrders: number;
    confirmedOrders: number;
    preparingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
  }> {
    const orders = await this.getOrders(userId, userRole);
    
    return {
      totalOrders: orders.length,
      draftOrders: orders.filter(o => o.status === 'draft').length,
      confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
      preparingOrders: orders.filter(o => o.status === 'preparing').length,
      shippedOrders: orders.filter(o => o.status === 'shipped').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0),
    };
  }

  private canUpdateOrderStatus(
    order: EnhancedOrder,
    newStatus: EnhancedOrder['status'],
    userRole?: string
  ): boolean {
    const statusTransitions = {
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
        return userRole === 'manager';
      case 'preparing':
      case 'shipped':
        return userRole === 'warehouse' || userRole === 'manager';
      case 'delivered':
        return userRole === 'warehouse' || userRole === 'manager';
      default:
        return false;
    }
  }

  async confirmOrder(id: string, userId: string, userRole: string): Promise<EnhancedOrder | null> {
    if (userRole !== 'manager') {
      throw new Error('Chỉ Manager mới có thể xác nhận đơn hàng');
    }
    return this.updateOrderStatus(id, 'confirmed', userId, userRole);
  }

  async cancelOrder(id: string, reason: string, userId: string, userRole: string): Promise<EnhancedOrder | null> {
    if (userRole !== 'manager') {
      throw new Error('Chỉ Manager mới có thể hủy đơn hàng');
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === id);
        if (!order) {
          resolve(null);
          return;
        }

        order.status = 'cancelled';
        order.notes = (order.notes || '') + `\n[Hủy bởi Manager] Lý do: ${reason}`;
        order.updatedAt = new Date().toISOString();
        resolve(order);
      }, 500);
    });
  }

  async updateWorkflow(id: string, status: EnhancedOrder['status'], data: any): Promise<EnhancedOrder | null> {
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
  async getAll(): Promise<any[]> {
    return this.getOrders();
  }

  async create(orderData: any): Promise<any> {
    return this.createOrder(orderData);
  }

  async updateStatus(id: string, status: any): Promise<any> {
    return this.updateOrderStatus(id, status);
  }

  async cancel(id: string, reason: string): Promise<any> {
    return this.cancelOrder(id, reason, '', 'manager');
  }
}

export const orderService = new EnhancedOrderService();
export const enhancedOrderService = new EnhancedOrderService();