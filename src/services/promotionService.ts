import { EnhancedPromotion } from '../types';
import { BaseHybridService } from './baseService';

class PromotionService extends BaseHybridService {
  private promotions: EnhancedPromotion[] = [
    {
      id: '1',
      name: 'Giảm giá 10% cho đơn hàng trên 500k',
      type: 'percentage',
      value: 10,
      minOrderAmount: 500000,
      isActive: true,
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Miễn phí vận chuyển',
      type: 'free_shipping',
      value: 0,
      minOrderAmount: 300000,
      isActive: true,
      startDate: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  async getAll(): Promise<EnhancedPromotion[]> {
    const mockFallback = async () => {
      return new Promise<EnhancedPromotion[]>((resolve) => {
        setTimeout(() => resolve([...this.promotions]), this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedPromotion[]>(
        '/promotions',
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getById(id: string): Promise<EnhancedPromotion | null> {
    const mockFallback = async () => {
      return new Promise<EnhancedPromotion | null>((resolve) => {
        setTimeout(() => {
          const promotion = this.promotions.find(p => p.id === id) || null;
          resolve(promotion);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedPromotion | null>(
        `/promotions/${id}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getActivePromotions(): Promise<EnhancedPromotion[]> {
    const mockFallback = async () => {
      return new Promise<EnhancedPromotion[]>((resolve) => {
        setTimeout(() => {
          const now = new Date();
          const activePromotions = this.promotions.filter(p => {
            if (!p.isActive) return false;

            const startDate = p.startDate ? new Date(p.startDate) : null;
            const endDate = p.endDate ? new Date(p.endDate) : null;

            if (startDate && startDate > now) return false;
            if (endDate && endDate < now) return false;

            return true;
          });
          resolve(activePromotions);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedPromotion[]>(
        '/promotions/active',
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async findApplicablePromotions(orderTotal: number): Promise<EnhancedPromotion[]> {
    const activePromotions = await this.getActivePromotions();
    return activePromotions.filter(p => 
      !p.minOrderAmount || orderTotal >= p.minOrderAmount
    );
  }

  async calculateDiscount(promotion: EnhancedPromotion, orderTotal: number, shippingFee: number = 0): Promise<{
    discountAmount: number;
    newShippingFee: number;
    description: string;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let discountAmount = 0;
        let newShippingFee = shippingFee;
        let description = '';

        switch (promotion.type) {
          case 'percentage':
            discountAmount = Math.floor(orderTotal * promotion.value / 100);
            description = `Giảm ${promotion.value}% đơn hàng`;
            break;
          case 'fixed_amount':
            discountAmount = Math.min(promotion.value, orderTotal);
            description = `Giảm ${promotion.value.toLocaleString()}đ`;
            break;
          case 'free_shipping':
            newShippingFee = 0;
            description = 'Miễn phí vận chuyển';
            break;
        }

        resolve({
          discountAmount,
          newShippingFee,
          description
        });
      }, 100);
    });
  }

  async create(promotion: Omit<EnhancedPromotion, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnhancedPromotion> {
    const mockFallback = async () => {
      return new Promise<EnhancedPromotion>((resolve) => {
        setTimeout(() => {
          const newPromotion: EnhancedPromotion = {
            ...promotion,
            id: `PROMO-${Date.now().toString().slice(-6)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.promotions.push(newPromotion);
          resolve(newPromotion);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedPromotion>(
        '/promotions',
        {
          method: 'POST',
          body: JSON.stringify(promotion),
        },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async update(id: string, updates: Partial<EnhancedPromotion>): Promise<EnhancedPromotion> {
    const mockFallback = async () => {
      return new Promise<EnhancedPromotion>((resolve, reject) => {
        setTimeout(() => {
          const index = this.promotions.findIndex(p => p.id === id);
          if (index === -1) {
            reject(new Error('Promotion not found'));
            return;
          }
          this.promotions[index] = {
            ...this.promotions[index],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          resolve(this.promotions[index]);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<EnhancedPromotion>(
        `/promotions/${id}`,
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
          const index = this.promotions.findIndex(p => p.id === id);
          if (index === -1) {
            reject(new Error('Promotion not found'));
            return;
          }
          this.promotions.splice(index, 1);
          resolve();
        }, this.getMockDelay());
      });
    };

    try {
      await this.apiRequest<void>(
        `/promotions/${id}`,
        { method: 'DELETE' },
        mockFallback
      );
    } catch (error) {
      await mockFallback();
    }
  }

  async applyPromotion(orderTotal: number, items: any[]): Promise<{ applicable: boolean; discount: number }> {
    const mockFallback = async () => {
      return new Promise<{ applicable: boolean; discount: number }>((resolve) => {
        setTimeout(() => {
          // Mock logic to determine if promotion is applicable and calculate discount
          const applicable = orderTotal > 100; // Example condition
          const discount = applicable ? 10 : 0; // Example discount
          resolve({ applicable, discount });
        }, this.getMockDelay());
      });
    };

    return await this.apiRequest<{ applicable: boolean; discount: number }>(
        '/promotions/apply',
        {
          method: 'POST',
          body: JSON.stringify({ orderTotal, items }),
        },
        mockFallback
      );
  }
}

export const promotionService = new PromotionService();