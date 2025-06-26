import { DashboardStats } from '../types';
import { mockOrders, mockProducts, mockInventory } from '../data/mockData';

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = mockOrders.length;
        const totalProducts = mockProducts.length;
        const lowStockItems = mockInventory.filter(item => item.availableStock <= item.reorderLevel).length;

        resolve({
          totalRevenue,
          totalOrders,
          totalProducts,
          lowStockItems,
          currency: 'USD'
        });
      }, 300);
    });
  }

  async getSalesData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock sales data for charts
        const salesData = [
          { month: 'Jan', sales: 12000, orders: 45 },
          { month: 'Feb', sales: 15000, orders: 52 },
          { month: 'Mar', sales: 18000, orders: 61 },
          { month: 'Apr', sales: 22000, orders: 75 },
          { month: 'May', sales: 25000, orders: 83 },
          { month: 'Jun', sales: 28000, orders: 91 },
        ];
        resolve(salesData);
      }, 400);
    });
  }
}

export const dashboardService = new DashboardService();