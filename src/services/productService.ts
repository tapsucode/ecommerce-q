import { Product } from '../types';
import { mockProducts } from '../data/mockData';

class ProductService {
  private products: Product[] = mockProducts;

  async getAll(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.products), 500);
    });
  }

  async getById(id: string): Promise<Product | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = this.products.find(p => p.id === id) || null;
        resolve(product);
      }, 300);
    });
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct: Product = {
          ...product,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.products.push(newProduct);
        resolve(newProduct);
      }, 800);
    });
  }

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    return new Promise((resolve, reject) => {
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
      }, 600);
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error('Product not found'));
          return;
        }
        this.products.splice(index, 1);
        resolve();
      }, 400);
    });
  }
}

export const productService = new ProductService();