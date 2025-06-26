import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../../hooks/useInventory';
import { Search, AlertTriangle, Package, Edit } from 'lucide-react';
import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import StockAdjustmentForm from './components/StockAdjustmentForm';
import { InventoryItem } from '../../types';
import { format } from 'date-fns';

const Inventory: React.FC = () => {
  const { t } = useTranslation();
  const { inventory, loading, updateStock } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'low' && item.availableStock <= item.reorderLevel) ||
      (filterStatus === 'out' && item.availableStock === 0);
    
    return matchesSearch && matchesFilter;
  });

  const handleStockAdjustment = async (itemId: string, newStock: number) => {
    try {
      await updateStock(itemId, newStock);
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.availableStock === 0) {
      return { status: t('inventory.outOfStock'), color: 'text-red-600 bg-red-100' };
    } else if (item.availableStock <= item.reorderLevel) {
      return { status: t('inventory.lowStock'), color: 'text-orange-600 bg-orange-100' };
    } else {
      return { status: t('inventory.inStock'), color: 'text-green-600 bg-green-100' };
    }
  };

  const columns = [
    {
      key: 'productName',
      title: t('inventory.product'),
      render: (value: string, record: InventoryItem) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">SKU: {record.sku}</p>
        </div>
      ),
    },
    {
      key: 'warehouse',
      title: t('inventory.location'),
      render: (value: string, record: InventoryItem) => (
        <div>
          <p className="text-sm text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{record.location}</p>
        </div>
      ),
    },
    {
      key: 'currentStock',
      title: t('inventory.currentStock'),
      render: (value: number) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'availableStock',
      title: t('inventory.available'),
      render: (value: number) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'reservedStock',
      title: t('inventory.reserved'),
      render: (value: number) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: 'reorderLevel',
      title: t('inventory.reorderLevel'),
      render: (value: number) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: 'status',
      title: t('common.status'),
      render: (value: any, record: InventoryItem) => {
        const { status, color } = getStockStatus(record);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {record.availableStock <= record.reorderLevel && record.availableStock > 0 && (
              <AlertTriangle className="h-3 w-3 mr-1" />
            )}
            {status}
          </span>
        );
      },
    },
    {
      key: 'lastUpdated',
      title: t('common.lastUpdated'),
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {format(new Date(value), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (value: any, record: InventoryItem) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSelectedItem(record);
            setIsModalOpen(true);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const lowStockCount = inventory.filter(item => item.availableStock <= item.reorderLevel).length;
  const outOfStockCount = inventory.filter(item => item.availableStock === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('inventory.title')}</h1>
        <p className="text-gray-600 mt-2">{t('inventory.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{inventory.length}</h3>
              <p className="text-sm text-gray-600">{t('inventory.totalItems')}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{lowStockCount}</h3>
              <p className="text-sm text-gray-600">{t('inventory.lowStockItems')}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <Package className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{outOfStockCount}</h3>
              <p className="text-sm text-gray-600">{t('inventory.outOfStock')}</p>
            </div>
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
              placeholder={t('inventory.searchInventory')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('inventory.allItems')}</option>
            <option value="low">{t('inventory.lowStock')}</option>
            <option value="out">{t('inventory.outOfStockFilter')}</option>
          </select>
        </div>

        <Table columns={columns} data={filteredInventory} loading={loading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        title={t('inventory.adjustStock')}
        size="md"
      >
        {selectedItem && (
          <StockAdjustmentForm
            item={selectedItem}
            onSubmit={handleStockAdjustment}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedItem(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Inventory;