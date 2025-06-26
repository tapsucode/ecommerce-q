import { User, LoginRequest, LoginResponse } from '../types';

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    username: 'manager1',
    email: 'manager@company.com',
    fullName: 'Nguyễn Văn Manager',
    phone: '0901234567',
    role: 'manager',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'sales1',
    email: 'sales1@company.com',
    fullName: 'Trần Thị Sales',
    phone: '0907654321',
    role: 'salesperson',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    username: 'warehouse1',
    email: 'warehouse@company.com',
    fullName: 'Lê Văn Warehouse',
    phone: '0909876543',
    role: 'warehouse',
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

  canAccessOrder(orderId: string, salesPersonId?: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Manager can access all orders
    if (user.role === 'manager') return true;

    // Salesperson can only access their own orders
    if (user.role === 'salesperson') {
      return user.id === salesPersonId;
    }

    // Warehouse can access confirmed orders for preparation
    if (user.role === 'warehouse') return true;

    return false;
  }

  canPerformAction(action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const permissions = {
      manager: [
        'view_all_orders',
        'confirm_order',
        'cancel_order',
        'view_reports',
        'manage_users',
        'manage_promotions',
      ],
      salesperson: [
        'create_order',
        'view_own_orders',
        'search_customers',
        'apply_promotions',
      ],
      warehouse: [
        'view_confirmed_orders',
        'update_order_status',
        'manage_inventory',
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