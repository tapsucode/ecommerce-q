import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrders } from '../../hooks/useOrders';
import { Search, Plus, Eye } from 'lucide-react';
import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import OrderWorkflowActions from './components/OrderWorkflowActions';
import { format } from 'date-fns';

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = async (orderData: any) => {
    try {
      await createOrder(orderData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'online': return 'bg-blue-100 text-blue-800';
      case 'retail': return 'bg-green-100 text-green-800';
      case 'wholesale': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
        <div>
          <p className="text-sm text-gray-500">
            {format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
      ),
    },
    {
        <div>
        </div>
      ),
    },
    {
      ),
    },
    {
      key: 'total',
        <div>
          <span className="font-semibold text-gray-900">
          </span>
          {record.shippingFee && record.shippingFee > 0 && (
            <p className="text-xs text-gray-500">
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
        </span>
      ),
    },
    {
      key: 'items',
      ),
    },
    {
      key: 'actions',
        <div className="flex items-center space-x-2">
          <OrderWorkflowActions 
            order={record} 
          />
          <Button size="sm" variant="secondary">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const statusStats = {
    total: orders.length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('orders.title')}</h1>
          <p className="text-gray-600 mt-2">{t('orders.subtitle')}</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('orders.createOrder')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{statusStats.total}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statusStats.confirmed}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statusStats.shipped}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('orders.searchOrders')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('orders.allStatus')}</option>
            <option value="pending">{t('orders.pending')}</option>
            <option value="confirmed">{t('orders.confirmed')}</option>
            <option value="processing">{t('orders.processing')}</option>
            <option value="shipped">{t('orders.shipped')}</option>
            <option value="completed">{t('orders.completed')}</option>
            <option value="delivered">{t('orders.delivered')}</option>
            <option value="returned">{t('orders.returned')}</option>
            <option value="cancelled">{t('orders.cancelled')}</option>
          </select>
        </div>

        <Table columns={columns} data={filteredOrders} loading={loading} />
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="xl"
      >
          onSubmit={handleCreateOrder}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Orders;