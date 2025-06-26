import { InventoryItem } from '../types';
import { mockInventory } from '../data/mockData';

class InventoryService {
  private inventory: InventoryItem[] = mockInventory;

  async getAll(): Promise<InventoryItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.inventory), 400);
    });
  }

  async updateStock(id: string, quantity: number): Promise<InventoryItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.inventory.findIndex(item => item.id === id);
        if (index === -1) {
          reject(new Error('Inventory item not found'));
          return;
        }
        this.inventory[index] = {
          ...this.inventory[index],
          currentStock: quantity,
          availableStock: quantity - this.inventory[index].reservedStock,
          lastUpdated: new Date().toISOString(),
        };
        resolve(this.inventory[index]);
      }, 500);
    });
  }

  async adjustStock(id: string, adjustment: number): Promise<InventoryItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.inventory.findIndex(item => item.id === id);
        if (index === -1) {
          reject(new Error('Inventory item not found'));
          return;
        }
        const newStock = this.inventory[index].currentStock + adjustment;
        this.inventory[index] = {
          ...this.inventory[index],
          currentStock: newStock,
          availableStock: newStock - this.inventory[index].reservedStock,
          lastUpdated: new Date().toISOString(),
        };
        resolve(this.inventory[index]);
      }, 500);
    });
  }
}

export const inventoryService = new InventoryService();