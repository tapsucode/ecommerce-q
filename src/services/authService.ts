import { User, LoginRequest, LoginResponse } from '../types';

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    fullName: 'Quản trị viên',
    phone: '0901234567',
    role: 'admin',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'manager',
    email: 'manager@company.com',
    fullName: 'Quản lý',
    phone: '0907654321',
    role: 'manager',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    username: 'employee',
    email: 'employee@company.com',
    fullName: 'Nhân viên',
    phone: '0909876543',
    role: 'employee',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication - in production, this would call your Spring Boot backend
    const user = mockUsers.find(u => u.username === loginData.username);
    
    if (!user || !user.active) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // Mock password check - in production, this would be handled by backend
    const mockPassword = 'password123'; // In real app, this would be hashed and compared on backend
    if (loginData.password !== mockPassword) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const token = this.generateMockToken(user);
    const response: LoginResponse = {
      user,
      token,
    };

    // Store auth data in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  canAccessOrder(orderId: string, employeeId?: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin can access all orders
    if (user.role === 'admin') return true;

    // Manager can access all orders
    if (user.role === 'manager') return true;

    // Employee can only access their own orders
    if (user.role === 'employee') {
      return user.id === employeeId;
    }

    return false;
  }

  canPerformAction(action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const permissions = {
      admin: [
        'view_all_orders',
        'confirm_order',
        'cancel_order',
        'view_reports',
        'manage_users',
        'manage_promotions',
        'manage_inventory',
        'update_order_status',
        'prepare_orders',
        'ship_orders',
        'create_order',
        'search_customers',
        'apply_promotions',
      ],
      manager: [
        'view_all_orders',
        'confirm_order',
        'cancel_order',
        'view_reports',
        'manage_promotions',
        'create_order',
        'search_customers',
        'apply_promotions',
      ],
      employee: [
        'create_order',
        'view_own_orders',
        'search_customers',
        'apply_promotions',
        'manage_inventory',
        'update_order_status',
        'prepare_orders',
        'ship_orders',
      ],
    };

    return permissions[user.role]?.includes(action) || false;
  }

  private generateMockToken(user: User): string {
    // Mock JWT token generation - in production, this would come from your backend
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    
    return `mock.${btoa(JSON.stringify(payload))}.signature`;
  }
}

export const authService = new AuthService();