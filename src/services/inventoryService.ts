
import { InventoryItem } from '../types';
import { mockInventory } from '../data/mockData';
import { BaseHybridService } from './baseService';

class InventoryService extends BaseHybridService {
  private inventory: InventoryItem[] = [...mockInventory];

  async getAll(): Promise<InventoryItem[]> {
    const mockFallback = async () => {
      return new Promise<InventoryItem[]>((resolve) => {
        setTimeout(() => resolve([...this.inventory]), this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<InventoryItem[]>(
        '/inventory',
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getById(id: string): Promise<InventoryItem | null> {
    const mockFallback = async () => {
      return new Promise<InventoryItem | null>((resolve) => {
        setTimeout(() => {
          const item = this.inventory.find(i => i.id === id) || null;
          resolve(item);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<InventoryItem | null>(
        `/inventory/${id}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    const mockFallback = async () => {
      return new Promise<InventoryItem[]>((resolve) => {
        setTimeout(() => {
          const lowStock = this.inventory.filter(item => 
            item.availableStock <= item.reorderLevel
          );
          resolve(lowStock);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<InventoryItem[]>(
        '/inventory/low-stock',
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async updateStock(id: string, quantity: number): Promise<InventoryItem> {
    const mockFallback = async () => {
      return new Promise<InventoryItem>((resolve, reject) => {
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
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<InventoryItem>(
        `/inventory/${id}/update-stock`,
        {
          method: 'PUT',
          body: JSON.stringify({ quantity }),
        },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async adjustStock(id: string, adjustment: number, reason?: string): Promise<InventoryItem> {
    const mockFallback = async () => {
      return new Promise<InventoryItem>((resolve, reject) => {
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
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<InventoryItem>(
        `/inventory/${id}/adjust-stock`,
        {
          method: 'POST',
          body: JSON.stringify({ adjustment, reason }),
        },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async reserveStock(productId: string, variantId: string | undefined, quantity: number): Promise<boolean> {
    const mockFallback = async () => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const item = this.inventory.find(i => 
            i.productId === productId && 
            (variantId ? i.variantId === variantId : !i.variantId)
          );
          
          if (!item || item.availableStock < quantity) {
            resolve(false);
            return;
          }

          item.reservedStock += quantity;
          item.availableStock -= quantity;
          item.lastUpdated = new Date().toISOString();
          resolve(true);
        }, this.getMockDelay());
      });
    };

    try {
      const response = await this.apiRequest<{ success: boolean }>(
        '/inventory/reserve-stock',
        {
          method: 'POST',
          body: JSON.stringify({ productId, variantId, quantity }),
        },
        async () => ({ success: await mockFallback() })
      );
      return response.success;
    } catch (error) {
      return await mockFallback();
    }
  }

  async releaseStock(productId: string, variantId: string | undefined, quantity: number): Promise<boolean> {
    const mockFallback = async () => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          const item = this.inventory.find(i => 
            i.productId === productId && 
            (variantId ? i.variantId === variantId : !i.variantId)
          );
          
          if (!item || item.reservedStock < quantity) {
            resolve(false);
            return;
          }

          item.reservedStock -= quantity;
          item.availableStock += quantity;
          item.lastUpdated = new Date().toISOString();
          resolve(true);
        }, this.getMockDelay());
      });
    };

    try {
      const response = await this.apiRequest<{ success: boolean }>(
        '/inventory/release-stock',
        {
          method: 'POST',
          body: JSON.stringify({ productId, variantId, quantity }),
        },
        async () => ({ success: await mockFallback() })
      );
      return response.success;
    } catch (error) {
      return await mockFallback();
    }
  }
}

export const inventoryService = new InventoryService();
