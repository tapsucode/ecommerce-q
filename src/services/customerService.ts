import { Customer } from '../types';
import { mockCustomers } from '../data/mockData';

class CustomerService {
  private customers: Customer[] = mockCustomers;

  async getAll(): Promise<Customer[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.customers), 400);
    });
  }

  async getById(id: string): Promise<Customer | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customer = this.customers.find(c => c.id === id) || null;
        resolve(customer);
      }, 300);
    });
  }

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>): Promise<Customer> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCustomer: Customer = {
          ...customer,
          id: Math.random().toString(36).substr(2, 9),
          totalOrders: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
        };
        this.customers.push(newCustomer);
        resolve(newCustomer);
      }, 800);
    });
  }

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.customers.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error('Customer not found'));
          return;
        }
        this.customers[index] = {
          ...this.customers[index],
          ...updates,
        };
        resolve(this.customers[index]);
      }, 600);
    });
  }
}

export const customerService = new CustomerService();