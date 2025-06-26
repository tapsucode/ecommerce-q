import { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { serviceFactory } from '../services/serviceFactory';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const service = serviceFactory.getInventoryService();
      const data = await service.getAll();
      setInventory(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: string, quantity: number) => {
    try {
      const service = serviceFactory.getInventoryService();
      const updatedItem = await service.updateStock(id, quantity);
      setInventory(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      setError('Failed to update stock');
      throw err;
    }
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.availableStock <= item.reorderLevel);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    error,
    fetchInventory,
    updateStock,
    getLowStockItems
  };
};