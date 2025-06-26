import { useState, useEffect } from 'react';
import { EnhancedPromotion } from '../types';
import { serviceFactory } from '../services/serviceFactory';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<EnhancedPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const service = serviceFactory.getPromotionService();
      const data = await service.getAll();
      setPromotions(data);
    } catch (error) {
      setError('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async (promotion: Omit<EnhancedPromotion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    try {
      const service = serviceFactory.getPromotionService();
      const newPromotion = await service.create(promotion);
      setPromotions(prev => [...prev, newPromotion]);
      return newPromotion;
    } catch (err) {
      setError('Failed to create promotion');
      throw err;
    }
  };

  const updatePromotion = async (id: string, promotion: Partial<EnhancedPromotion>) => {
    try {
      const service = serviceFactory.getPromotionService();
      const updatedPromotion = await service.update(id, promotion);
      setPromotions(prev => prev.map(p => p.id === id ? updatedPromotion : p));
      return updatedPromotion;
    } catch (err) {
      setError('Failed to update promotion');
      throw err;
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      const service = serviceFactory.getPromotionService();
      await service.delete(id);
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete promotion');
      throw err;
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion
  };
};