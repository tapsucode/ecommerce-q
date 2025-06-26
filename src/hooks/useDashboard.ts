import { useState, useEffect } from 'react';
import { DashboardStats } from '../types';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const service = serviceFactory.getDashboardService();
      const data = await service.getStats();
      setStats(data);
    } catch (error) {
      setError('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};