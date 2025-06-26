
import { Product } from '../types';
import { mockProducts } from '../data/mockData';
import { BaseHybridService } from './baseService';

class ProductService extends BaseHybridService {
  private products: Product[] = [...mockProducts];

  async getAll(): Promise<Product[]> {
    const mockFallback = async () => {
      return new Promise<Product[]>((resolve) => {
        setTimeout(() => resolve([...this.products]), this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<Product[]>(
        '/products',
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getById(id: string): Promise<Product | null> {
    const mockFallback = async () => {
      return new Promise<Product | null>((resolve) => {
        setTimeout(() => {
          const product = this.products.find(p => p.id === id) || null;
          resolve(product);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<Product | null>(
        `/products/${id}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async search(query: string): Promise<Product[]> {
    const mockFallback = async () => {
      return new Promise<Product[]>((resolve) => {
        setTimeout(() => {
          const filtered = this.products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.sku.toLowerCase().includes(query.toLowerCase())
          );
          resolve(filtered);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<Product[]>(
        `/products/search?query=${encodeURIComponent(query)}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const mockFallback = async () => {
      return new Promise<Product>((resolve) => {
        setTimeout(() => {
          const newProduct: Product = {
            ...product,
            id: `PROD-${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.products.push(newProduct);
          resolve(newProduct);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<Product>(
        '/products',
        {
          method: 'POST',
          body: JSON.stringify(product),
        },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const mockFallback = async () => {
      return new Promise<Product>((resolve, reject) => {
        setTimeout(() => {
          const index = this.products.findIndex(p => p.id === id);
          if (index === -1) {
            reject(new Error('Product not found'));
            return;
          }
          this.products[index] = {
            ...this.products[index],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          resolve(this.products[index]);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<Product>(
        `/products/${id}`,
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
          const index = this.products.findIndex(p => p.id === id);
          if (index === -1) {
            reject(new Error('Product not found'));
            return;
          }
          this.products.splice(index, 1);
          resolve();
        }, this.getMockDelay());
      });
    };

    try {
      await this.apiRequest<void>(
        `/products/${id}`,
        { method: 'DELETE' },
        mockFallback
      );
    } catch (error) {
      await mockFallback();
    }
  }
}

export const productService = new ProductService();
