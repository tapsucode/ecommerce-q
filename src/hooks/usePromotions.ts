import { useState, useEffect } from 'react';
import { Promotion } from '../types';
import { promotionService } from '../services/promotionService';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await promotionService.getAll();
      setPromotions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch promotions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async (promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    try {
      const newPromotion = await promotionService.create(promotion);
      setPromotions(prev => [...prev, newPromotion]);
      return newPromotion;
    } catch (err) {
      setError('Failed to create promotion');
      throw err;
    }
  };

  const updatePromotion = async (id: string, promotion: Partial<Promotion>) => {
    try {
      const updatedPromotion = await promotionService.update(id, promotion);
      setPromotions(prev => prev.map(p => p.id === id ? updatedPromotion : p));
      return updatedPromotion;
    } catch (err) {
      setError('Failed to update promotion');
      throw err;
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      await promotionService.delete(id);
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