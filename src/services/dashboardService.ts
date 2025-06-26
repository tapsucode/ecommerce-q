import { DashboardStats } from '../types';
import { BaseHybridService } from './baseService';

class DashboardService extends BaseHybridService {
  async getStats(userId?: string, userRole?: string): Promise<DashboardStats> {
    const mockFallback = async () => {
      return new Promise<DashboardStats>((resolve) => {
        setTimeout(() => {
          // Mock data based on role
          let stats: DashboardStats;

          if (userRole === 'employee') {
            // Employee sees limited stats
            stats = {
              totalRevenue: 45000000,
              totalOrders: 23,
              totalProducts: 156,
              lowStockItems: 8,
              currency: 'VND'
            };
          } else {
            // Manager and Admin see full stats
            stats = {
              totalRevenue: 125000000,
              totalOrders: 87,
              totalProducts: 456,
              lowStockItems: 12,
              currency: 'VND'
            };
          }

          resolve(stats);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<DashboardStats>(
        `/dashboard/statistics?userId=${userId}&userRole=${userRole}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getSalesData(userId?: string, userRole?: string): Promise<any[]> {
    const mockFallback = async () => {
      return new Promise<any[]>((resolve) => {
        setTimeout(() => {
          // Mock sales data for charts
          const salesData = userRole === 'employee' ? [
            { month: 'Jan', sales: 3200000, orders: 12 },
            { month: 'Feb', sales: 4100000, orders: 15 },
            { month: 'Mar', sales: 3800000, orders: 13 },
            { month: 'Apr', sales: 5200000, orders: 18 },
            { month: 'May', sales: 4900000, orders: 16 },
            { month: 'Jun', sales: 6100000, orders: 21 },
          ] : [
            { month: 'Jan', sales: 12000000, orders: 45 },
            { month: 'Feb', sales: 15000000, orders: 52 },
            { month: 'Mar', sales: 18000000, orders: 61 },
            { month: 'Apr', sales: 22000000, orders: 75 },
            { month: 'May', sales: 25000000, orders: 83 },
            { month: 'Jun', sales: 28000000, orders: 91 },
          ];
          resolve(salesData);
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<any[]>(
        `/dashboard/sales-data?userId=${userId}&userRole=${userRole}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getRecentOrders(userId?: string, userRole?: string, limit: number = 5): Promise<any[]> {
    const mockFallback = async () => {
      return new Promise<any[]>((resolve) => {
        setTimeout(() => {
          // Mock recent orders data
          const mockOrders = [
            { id: 'ORD-001', customer: 'Nguyễn Văn A', total: 1200000, status: 'confirmed' },
            { id: 'ORD-002', customer: 'Trần Thị B', total: 850000, status: 'preparing' },
            { id: 'ORD-003', customer: 'Lê Văn C', total: 2100000, status: 'shipped' },
            { id: 'ORD-004', customer: 'Phạm Thị D', total: 750000, status: 'delivered' },
            { id: 'ORD-005', customer: 'Hoàng Văn E', total: 1650000, status: 'confirmed' },
          ];

          resolve(mockOrders.slice(0, limit));
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<any[]>(
        `/dashboard/recent-orders?userId=${userId}&userRole=${userRole}&limit=${limit}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }

  async getTopProducts(userId?: string, userRole?: string, limit: number = 5): Promise<any[]> {
    const mockFallback = async () => {
      return new Promise<any[]>((resolve) => {
        setTimeout(() => {
          const topProducts = [
            { name: 'Áo thun nam', sales: 125, revenue: 25000000 },
            { name: 'Quần jean nữ', sales: 98, revenue: 19600000 },
            { name: 'Giày thể thao', sales: 87, revenue: 34800000 },
            { name: 'Túi xách', sales: 76, revenue: 15200000 },
            { name: 'Đồng hồ', sales: 65, revenue: 32500000 },
          ];

          resolve(topProducts.slice(0, limit));
        }, this.getMockDelay());
      });
    };

    try {
      return await this.apiRequest<any[]>(
        `/dashboard/top-products?userId=${userId}&userRole=${userRole}&limit=${limit}`,
        { method: 'GET' },
        mockFallback
      );
    } catch (error) {
      return await mockFallback();
    }
  }
}

export const dashboardService = new DashboardService();