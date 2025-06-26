import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders } from '../../../hooks/useOrders';
import { format } from 'date-fns';

const RecentOrders: React.FC = () => {
  const { t } = useTranslation();
  const { orders, loading } = useOrders();
  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{order.orderNumber}</p>
            <p className="text-sm text-gray-600">{order.customerName}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(order.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {t(`orders.${order.status}`)}
            </span>
          </div>
        </div>
      ))}
      {recentOrders.length === 0 && (
        <p className="text-gray-500 text-center py-4">{t('dashboard.noRecentOrders')}</p>
      )}
    </div>
  );
};

export default RecentOrders;