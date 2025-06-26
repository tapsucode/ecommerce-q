import { useState, useEffect } from 'react';
import { PurchaseOrder } from '../types';
import { purchaseOrderService } from '../services/purchaseOrderService';

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const data = await purchaseOrderService.getAll();
      setPurchaseOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch purchase orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createPurchaseOrder = async (purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPurchaseOrder = await purchaseOrderService.create(purchaseOrder);
      setPurchaseOrders(prev => [...prev, newPurchaseOrder]);
      return newPurchaseOrder;
    } catch (err) {
      setError('Failed to create purchase order');
      throw err;
    }
  };

  const updatePurchaseOrder = async (id: string, purchaseOrder: Partial<PurchaseOrder>) => {
    try {
      const updatedPurchaseOrder = await purchaseOrderService.update(id, purchaseOrder);
      setPurchaseOrders(prev => prev.map(po => po.id === id ? updatedPurchaseOrder : po));
      return updatedPurchaseOrder;
    } catch (err) {
      setError('Failed to update purchase order');
      throw err;
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      await purchaseOrderService.delete(id);
      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
    } catch (err) {
      setError('Failed to delete purchase order');
      throw err;
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return {
    purchaseOrders,
    loading,
    error,
    fetchPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
  };
};