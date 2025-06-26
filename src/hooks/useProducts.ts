import { useState, useEffect } from 'react';
import { Product } from '../types';
import { productService } from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const service = serviceFactory.getProductService();
      const data = await service.getAll();
      setProducts(data);
    } catch (error) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = await productService.create(product);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError('Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const updatedProduct = await productService.update(id, product);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      setError('Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete product');
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};