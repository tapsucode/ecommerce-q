import { useState, useEffect } from 'react';
import { EnhancedOrder } from '../types';
import { orderService } from '../services/orderService';
import { useAuth } from './useAuth';

export const useOrders = () => {
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, canPerformAction } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders(user?.id, user?.role);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Partial<EnhancedOrder>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const orderWithSalesPerson = {
        ...orderData,
        salesPerson: user,
        status: 'draft' as const
      };
      
      const newOrder = await orderService.createOrder(orderWithSalesPerson);
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      setError('Failed to create order');
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: EnhancedOrder['status']) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const updatedOrder = await orderService.updateOrderStatus(id, status, user.id, user.role);
      if (updatedOrder) {
        setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      }
      return updatedOrder;
    } catch (err) {
      setError('Failed to update order status');
      throw err;
    }
  };

  const confirmOrder = async (id: string) => {
    if (!canPerformAction('confirm_order')) {
      throw new Error('Không có quyền xác nhận đơn hàng');
    }
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedOrder = await orderService.confirmOrder(id, user.id, user.role);
      if (updatedOrder) {
        setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      }
      return updatedOrder;
    } catch (err) {
      setError('Failed to confirm order');
      throw err;
    }
  };

  const cancelOrder = async (id: string, reason: string = '') => {
    if (!canPerformAction('cancel_order')) {
      throw new Error('Không có quyền hủy đơn hàng');
    }
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedOrder = await orderService.cancelOrder(id, reason, user.id, user.role);
      if (updatedOrder) {
        setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      }
      return updatedOrder;
    } catch (err) {
      setError('Failed to cancel order');
      throw err;
    }
  };

  const updateOrderWorkflow = async (id: string, status: EnhancedOrder['status'], data?: any) => {
    try {
      const updatedOrder = await orderService.updateWorkflow(id, status, data);
      if (updatedOrder) {
        setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      }
      return updatedOrder;
    } catch (err) {
      setError('Failed to update order workflow');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    confirmOrder,
    cancelOrder,
    updateOrderWorkflow
  };
};