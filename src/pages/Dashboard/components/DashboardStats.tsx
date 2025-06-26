import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardStats as StatsType } from '../../../types';
import { DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
  stats: StatsType | null;
  loading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  const { t } = useTranslation();

  const statsConfig = [
    {
      title: t('dashboard.totalRevenue'),
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '$0',
      icon: DollarSign,
      color: 'bg-blue-500',
      change: '+12.3%',
    },
    {
      title: t('dashboard.totalOrders'),
      value: stats?.totalOrders.toString() || '0',
      icon: ShoppingCart,
      color: 'bg-emerald-500',
      change: '+8.7%',
    },
    {
      title: t('dashboard.totalProducts'),
      value: stats?.totalProducts.toString() || '0',
      icon: Package,
      color: 'bg-purple-500',
      change: '+2.1%',
    },
    {
      title: t('dashboard.lowStockItems'),
      value: stats?.lowStockItems.toString() || '0',
      icon: AlertTriangle,
      color: 'bg-orange-500',
      change: '-5.2%',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-sm text-emerald-600 mt-1">{stat.change} {t('dashboard.fromLastMonth')}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;