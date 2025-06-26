
import { EnhancedCustomer } from '../types';
import { mockCustomers } from '../data/mockData';
import { BaseHybridService } from './baseService';

class CustomerService extends BaseHybridService {
  private customers: EnhancedCustomer[] = mockCustomers.map(c => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    createdAt: c.createdAt,
    updatedAt: c.createdAt,
  }));

  async getAll(): Promise<EnhancedCustomer[]> {
    const mockFallback = async () => {
      return new Promise<EnhancedCustomer[]>((resolve) => {
        setTimeout(() => resolve([...this.customers]), this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedCustomer[]>(
        '/customers',
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getById(id: string): Promise<EnhancedCustomer | null> {
    const mockFallback = async () => {
      return new Promise<EnhancedCustomer | null>((resolve) => {
        setTimeout(() => {
          const customer = this.customers.find(c => c.id === id) || null;
          resolve(customer);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedCustomer | null>(
        `/customers/${id}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async searchByPhone(phone: string): Promise<EnhancedCustomer | null> {
    const mockFallback = async () => {
      return new Promise<EnhancedCustomer | null>((resolve) => {
        setTimeout(() => {
          const customer = this.customers.find(c => c.phone === phone) || null;
          resolve(customer);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedCustomer | null>(
        `/customers/search/phone?phone=${encodeURIComponent(phone)}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async create(customer: Omit<EnhancedCustomer, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnhancedCustomer> {
    const mockFallback = async () => {
      return new Promise<EnhancedCustomer>((resolve) => {
        setTimeout(() => {
          const newCustomer: EnhancedCustomer = {
            ...customer,
            id: `CUST-${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.customers.push(newCustomer);
          resolve(newCustomer);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedCustomer>(
        '/customers',
        {
          method: 'POST',
          body: JSON.stringify(customer),
        },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async update(id: string, updates: Partial<EnhancedCustomer>): Promise<EnhancedCustomer> {
    const mockFallback = async () => {
      return new Promise<EnhancedCustomer>((resolve, reject) => {
        setTimeout(() => {
          const index = this.customers.findIndex(c => c.id === id);
          if (index === -1) {
            reject(new Error('Customer not found'));
            return;
          }
          this.customers[index] = {
            ...this.customers[index],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          resolve(this.customers[index]);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedCustomer>(
        `/customers/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async delete(id: string): Promise<void> {
    const mockFallback = async () => {
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          const index = this.customers.findIndex(c => c.id === id);
          if (index === -1) {
            reject(new Error('Customer not found'));
            return;
          }
          this.customers.splice(index, 1);
          resolve();
        }, this.getMockDelay());
      });
    };

    try {
      await this.apiRequest<void>(
        `/customers/${id}`,
        { method: 'DELETE' },
        mockFallback
      );
    } catch (error) {
      await mockFallback();
    }
  }
}

export const customerService = new CustomerService();
