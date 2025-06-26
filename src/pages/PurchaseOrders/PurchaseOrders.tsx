import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { Search, Plus, Edit, Trash2, FileText } from 'lucide-react';
import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import PurchaseOrderForm from './components/PurchaseOrderForm';
import { PurchaseOrder } from '../../types';
import { format } from 'date-fns';

const PurchaseOrders: React.FC = () => {
  const { t } = useTranslation();
  const { purchaseOrders, loading, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = usePurchaseOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreatePurchaseOrder = async (poData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createPurchaseOrder(poData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create purchase order:', error);
    }
  };

  const handleUpdatePurchaseOrder = async (poData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPurchaseOrder) return;
    try {
      await updatePurchaseOrder(editingPurchaseOrder.id, poData);
      setEditingPurchaseOrder(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update purchase order:', error);
    }
  };

  const handleDeletePurchaseOrder = async (id: string) => {
    if (window.confirm(t('purchaseOrders.deleteConfirm'))) {
      try {
        await deletePurchaseOrder(id);
      } catch (error) {
        console.error('Failed to delete purchase order:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'partially_received': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'poNumber',
      title: t('purchaseOrders.poNumber'),
      render: (value: string, record: PurchaseOrder) => (
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{value}</span>
          </div>
          <p className="text-sm text-gray-500">
            {format(new Date(record.orderDate), 'dd/MM/yyyy')}
          </p>
        </div>
      ),
    },
    {
      key: 'supplier',
      title: t('purchaseOrders.supplier'),
      render: (value: any, record: PurchaseOrder) => (
        <div>
          <span className="font-medium text-gray-900">{record.supplier.name}</span>
          {record.supplier.contactPerson && (
            <p className="text-sm text-gray-500">{record.supplier.contactPerson}</p>
          )}
        </div>
      ),
    },
    {
      key: 'expectedDeliveryDate',
      title: t('purchaseOrders.expectedDelivery'),
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? format(new Date(value), 'dd/MM/yyyy') : '-'}
        </span>
      ),
    },
    {
      key: 'totalCost',
      title: t('purchaseOrders.totalCost'),
      render: (value: number) => (
        <span className="font-semibold text-gray-900">
          {value.toLocaleString()} VND
        </span>
      ),
    },
    {
      key: 'status',
      title: t('common.status'),
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {t(`purchaseOrders.${value}`)}
        </span>
      ),
    },
    {
      key: 'items',
      title: t('orders.items'),
      render: (value: any[]) => (
        <span className="text-sm text-gray-600">{value.length} sản phẩm</span>
      ),
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (value: any, record: PurchaseOrder) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditingPurchaseOrder(record);
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeletePurchaseOrder(record.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const poStats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(po => po.status === 'draft').length,
    ordered: purchaseOrders.filter(po => po.status === 'ordered').length,
    completed: purchaseOrders.filter(po => po.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('purchaseOrders.title')}</h1>
          <p className="text-gray-600 mt-2">{t('purchaseOrders.subtitle')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('purchaseOrders.addPurchaseOrder')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{poStats.total}</div>
            <div className="text-sm text-gray-600">{t('purchaseOrders.totalPurchaseOrders')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{poStats.draft}</div>
            <div className="text-sm text-gray-600">{t('purchaseOrders.draft')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{poStats.ordered}</div>
            <div className="text-sm text-gray-600">{t('purchaseOrders.ordered')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{poStats.completed}</div>
            <div className="text-sm text-gray-600">{t('purchaseOrders.completed')}</div>
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
              placeholder={t('purchaseOrders.searchPurchaseOrders')}
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
            <option value="all">{t('purchaseOrders.allStatus')}</option>
            <option value="draft">{t('purchaseOrders.draft')}</option>
            <option value="ordered">{t('purchaseOrders.ordered')}</option>
            <option value="partially_received">{t('purchaseOrders.partiallyReceived')}</option>
            <option value="completed">{t('purchaseOrders.completed')}</option>
            <option value="cancelled">{t('purchaseOrders.cancelled')}</option>
          </select>
        </div>

        <Table columns={columns} data={filteredPurchaseOrders} loading={loading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPurchaseOrder(null);
        }}
        title={editingPurchaseOrder ? t('purchaseOrders.editPurchaseOrder') : t('purchaseOrders.addNewPurchaseOrder')}
        size="xl"
      >
        <PurchaseOrderForm
          purchaseOrder={editingPurchaseOrder}
          onSubmit={editingPurchaseOrder ? handleUpdatePurchaseOrder : handleCreatePurchaseOrder}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPurchaseOrder(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default PurchaseOrders;