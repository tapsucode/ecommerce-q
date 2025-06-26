import { useState, useEffect } from 'react';
import { Customer } from '../types';
import { customerService } from '../services/customerService';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => {
    try {
      const newCustomer = await customerService.create(customer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError('Failed to create customer');
      throw err;
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      const updatedCustomer = await customerService.update(id, customer);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      setError('Failed to update customer');
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer
  };
};