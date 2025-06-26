import { PurchaseOrder } from '../types';
import { supplierService } from './supplierService';
import { productService } from './productService';

class PurchaseOrderService {
  private purchaseOrders: PurchaseOrder[] = [];

  async getAll(): Promise<PurchaseOrder[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.purchaseOrders), 400);
    });
  }

  async getById(id: string): Promise<PurchaseOrder | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const purchaseOrder = this.purchaseOrders.find(po => po.id === id) || null;
        resolve(purchaseOrder);
      }, 300);
    });
  }

  async create(purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPurchaseOrder: PurchaseOrder = {
          ...purchaseOrder,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.purchaseOrders.push(newPurchaseOrder);
        resolve(newPurchaseOrder);
      }, 800);
    });
  }

  async update(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.purchaseOrders.findIndex(po => po.id === id);
        if (index === -1) {
          reject(new Error('Purchase order not found'));
          return;
        }
        this.purchaseOrders[index] = {
          ...this.purchaseOrders[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        resolve(this.purchaseOrders[index]);
      }, 600);
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.purchaseOrders.findIndex(po => po.id === id);
        if (index === -1) {
          reject(new Error('Purchase order not found'));
          return;
        }
        this.purchaseOrders.splice(index, 1);
        resolve();
      }, 400);
    });
  }
}

export const purchaseOrderService = new PurchaseOrderService();