import { orders, orderItems, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type OrderWithItems, type CreateOrderRequest } from "@shared/schema";

export interface IStorage {
  // Order operations
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  getAllOrders(): Promise<OrderWithItems[]>;
  createOrder(orderData: CreateOrderRequest): Promise<OrderWithItems>;
  updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<OrderWithItems | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  searchOrders(query: string): Promise<OrderWithItems[]>;
  filterOrdersByStatus(status: string): Promise<OrderWithItems[]>;
  
  // Statistics
  getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    monthlyRevenue: number;
  }>;
}

export class MemStorage implements IStorage {
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem[]>;
  private currentOrderId: number;
  private currentItemId: number;

  constructor() {
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentOrderId = 1;
    this.currentItemId = 1;
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const orderNum = this.currentOrderId.toString().padStart(3, '0');
    return `ORD-${year}-${orderNum}`;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = this.orderItems.get(id) || [];
    return { ...order, items };
  }

  async getAllOrders(): Promise<OrderWithItems[]> {
    const allOrders: OrderWithItems[] = [];
    for (const [orderId, order] of this.orders) {
      const items = this.orderItems.get(orderId) || [];
      allOrders.push({ ...order, items });
    }
    return allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createOrder(orderData: CreateOrderRequest): Promise<OrderWithItems> {
    const orderId = this.currentOrderId++;
    const orderNumber = this.generateOrderNumber();
    
    // Calculate total
    const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order: Order = {
      id: orderId,
      orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || null,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress || null,
      status: 'pending',
      total: total.toString(),
      createdAt: new Date(),
    };

    this.orders.set(orderId, order);

    // Create order items
    const items: OrderItem[] = orderData.items.map(item => ({
      id: this.currentItemId++,
      orderId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price.toString(),
    }));

    this.orderItems.set(orderId, items);

    return { ...order, items };
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<OrderWithItems | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;

    const updatedOrder = { ...existingOrder, ...orderData };
    this.orders.set(id, updatedOrder);

    const items = this.orderItems.get(id) || [];
    return { ...updatedOrder, items };
  }

  async deleteOrder(id: number): Promise<boolean> {
    const deleted = this.orders.delete(id);
    if (deleted) {
      this.orderItems.delete(id);
    }
    return deleted;
  }

  async searchOrders(query: string): Promise<OrderWithItems[]> {
    const allOrders = await this.getAllOrders();
    const lowerQuery = query.toLowerCase();
    
    return allOrders.filter(order => 
      order.customerName.toLowerCase().includes(lowerQuery) ||
      order.orderNumber.toLowerCase().includes(lowerQuery) ||
      order.customerEmail?.toLowerCase().includes(lowerQuery) ||
      order.items.some(item => item.productName.toLowerCase().includes(lowerQuery))
    );
  }

  async filterOrdersByStatus(status: string): Promise<OrderWithItems[]> {
    const allOrders = await this.getAllOrders();
    if (status === 'all') return allOrders;
    
    return allOrders.filter(order => order.status === status);
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    monthlyRevenue: number;
  }> {
    const allOrders = Array.from(this.orders.values());
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + parseFloat(order.total), 0);

    return {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(order => order.status === 'pending').length,
      completedOrders: allOrders.filter(order => order.status === 'completed').length,
      monthlyRevenue,
    };
  }
}

export const storage = new MemStorage();
