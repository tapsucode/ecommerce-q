import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

export const useOrders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    try {
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      setError('Failed to create order');
      throw err;
    }
  };

    try {
        setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      return updatedOrder;
    } catch (err) {
      setError('Failed to update order status');
      throw err;
    }
  };

  useEffect(() => {
      fetchOrders();

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
  };
};