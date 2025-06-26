import { Order } from '../types';
import { mockOrders } from '../data/mockData';

class OrderService {
  private orders: Order[] = mockOrders;

  async getAll(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.orders), 400);
    });
  }

  async getById(id: string): Promise<Order | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === id) || null;
        resolve(order);
      }, 300);
    });
  }

  async create(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder: Order = {
          ...order,
          id: Math.random().toString(36).substr(2, 9),
          orderNumber: `ORD-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.orders.push(newOrder);
        resolve(newOrder);
      }, 800);
    });
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.orders.findIndex(o => o.id === id);
        if (index === -1) {
          reject(new Error('Order not found'));
          return;
        }
        this.orders[index] = {
          ...this.orders[index],
          status,
          updatedAt: new Date().toISOString(),
        };
        resolve(this.orders[index]);
      }, 500);
    });
  }
}

export const orderService = new OrderService();