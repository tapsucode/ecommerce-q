import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../hooks/useDashboard';
import { useInventory } from '../../hooks/useInventory';
import DashboardStats from './components/DashboardStats';
import SalesChart from './components/SalesChart';
import RecentOrders from './components/RecentOrders';
import LowStockAlert from './components/LowStockAlert';
import Card from '../../components/UI/Card';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { stats, loading: statsLoading } = useDashboard();
  const { inventory, loading: inventoryLoading } = useInventory();

  const lowStockItems = inventory.filter(item => item.availableStock <= item.reorderLevel);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-2">{t('dashboard.subtitle')}</p>
      </div>

      <DashboardStats stats={stats} loading={statsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dashboard.salesOverview')} className="lg:col-span-2">
          <SalesChart />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dashboard.recentOrders')}>
          <RecentOrders />
        </Card>
        
        <Card 
          title={t('dashboard.lowStockAlert')} 
          subtitle={`${lowStockItems.length} ${t('dashboard.itemsNeedAttention')}`}
        >
          <LowStockAlert items={lowStockItems} loading={inventoryLoading} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;