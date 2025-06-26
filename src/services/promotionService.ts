import { Promotion } from '../types';

class PromotionService {
  private promotions: Promotion[] = [
    {
      id: '1',
      name: 'Giảm giá 10% cho đơn hàng trên 500k',
      description: 'Áp dụng cho tất cả sản phẩm khi đơn hàng có giá trị từ 500,000 VND trở lên',
      type: 'percentage_discount',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      usageLimit: 1000,
      usageCount: 245,
      rules: [
        {
          id: '1',
          ruleType: 'condition',
          ruleData: { condition: 'cart_total', operator: '>=', value: '500000' },
          priority: 0
        },
        {
          id: '2',
          ruleType: 'action',
          ruleData: { action: 'discount_percentage', value: '10' },
          priority: 1
        }
      ],
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Miễn phí vận chuyển',
      description: 'Miễn phí vận chuyển cho đơn hàng trên 300k',
      type: 'free_shipping',
      startDate: '2024-01-01T00:00:00Z',
      usageCount: 156,
      rules: [
        {
          id: '3',
          ruleType: 'condition',
          ruleData: { condition: 'cart_total', operator: '>=', value: '300000' },
          priority: 0
        },
        {
          id: '4',
          ruleType: 'action',
          ruleData: { action: 'free_shipping', value: 'true' },
          priority: 1
        }
      ],
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  async getAll(): Promise<Promotion[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.promotions), 400);
    });
  }

  async getById(id: string): Promise<Promotion | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const promotion = this.promotions.find(p => p.id === id) || null;
        resolve(promotion);
      }, 300);
    });
  }

  async create(promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Promotion> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPromotion: Promotion = {
          ...promotion,
          id: Math.random().toString(36).substr(2, 9),
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.promotions.push(newPromotion);
        resolve(newPromotion);
      }, 800);
    });
  }

  async update(id: string, updates: Partial<Promotion>): Promise<Promotion> {
    return new Promise((resolve, reject) => {
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
      }, 600);
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.promotions.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error('Promotion not found'));
          return;
        }
        this.promotions.splice(index, 1);
        resolve();
      }, 400);
    });
  }

  async getActivePromotions(): Promise<Promotion[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const activePromotions = this.promotions.filter(p => {
          if (!p.active) return false;
          
          const startDate = p.startDate ? new Date(p.startDate) : null;
          const endDate = p.endDate ? new Date(p.endDate) : null;
          
          if (startDate && startDate > now) return false;
          if (endDate && endDate < now) return false;
          if (p.usageLimit && p.usageCount >= p.usageLimit) return false;
          
          return true;
        });
        resolve(activePromotions);
      }, 300);
    });
  }
}

export const promotionService = new PromotionService();