import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  canPerformAction: (action: string) => boolean;
  canAccessOrder: (orderId: string, salesPersonId?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (loginData: LoginRequest) => {
    try {
      const response = await authService.login(loginData);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const canPerformAction = (action: string): boolean => {
    return authService.canPerformAction(action);
  };

  const canAccessOrder = (orderId: string, salesPersonId?: string): boolean => {
    return authService.canAccessOrder(orderId, salesPersonId);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    canPerformAction,
    canAccessOrder,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};