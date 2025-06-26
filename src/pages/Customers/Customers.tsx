import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomers } from '../../hooks/useCustomers';
import { Search, Plus, Mail, Phone, Edit } from 'lucide-react';
import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import CustomerForm from './components/CustomerForm';
import { Customer } from '../../types';
import { format } from 'date-fns';

const Customers: React.FC = () => {
  const { t } = useTranslation();
  const { customers, loading, createCustomer, updateCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || customer.customerType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleCreateCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => {
    try {
      await createCustomer(customerData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const handleUpdateCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => {
    if (!editingCustomer) return;
    try {
      await updateCustomer(editingCustomer.id, customerData);
      setEditingCustomer(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const columns = [
    {
      key: 'name',
      title: t('orders.customer'),
      render: (value: string, record: Customer) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="h-3 w-3 mr-1" />
              {record.email}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="h-3 w-3 mr-1" />
              {record.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'country',
      title: t('customers.location'),
      render: (value: string, record: Customer) => (
        <div>
          <p className="text-sm text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 truncate max-w-xs">{record.address}</p>
        </div>
      ),
    },
    {
      key: 'customerType',
      title: t('customers.customerType'),
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
          value === 'wholesale' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {t(`customers.${value}`)}
        </span>
      ),
    },
    {
      key: 'totalOrders',
      title: t('customers.orders'),
      render: (value: number) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'totalSpent',
      title: t('customers.totalSpent'),
      render: (value: number, record: Customer) => (
        <span className="font-semibold text-gray-900">
          ${value.toFixed(2)} {record.currency}
        </span>
      ),
    },
    {
      key: 'lastOrderAt',
      title: t('customers.lastOrder'),
      render: (value: string | undefined) => (
        <span className="text-sm text-gray-500">
          {value ? format(new Date(value), 'MMM dd, yyyy') : t('customers.never')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (value: any, record: Customer) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditingCustomer(record);
            setIsModalOpen(true);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const customerStats = {
    total: customers.length,
    retail: customers.filter(c => c.customerType === 'retail').length,
    wholesale: customers.filter(c => c.customerType === 'wholesale').length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('customers.title')}</h1>
          <p className="text-gray-600 mt-2">{t('customers.subtitle')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('customers.addCustomer')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{customerStats.total}</div>
            <div className="text-sm text-gray-600">{t('customers.totalCustomers')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{customerStats.retail}</div>
            <div className="text-sm text-gray-600">{t('customers.retailCustomers')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{customerStats.wholesale}</div>
            <div className="text-sm text-gray-600">{t('customers.wholesaleCustomers')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">${customerStats.totalSpent.toFixed(0)}</div>
            <div className="text-sm text-gray-600">{t('customers.totalRevenue')}</div>
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
              placeholder={t('customers.searchCustomers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('customers.allTypes')}</option>
            <option value="retail">{t('customers.retail')}</option>
            <option value="wholesale">{t('customers.wholesale')}</option>
          </select>
        </div>

        <Table columns={columns} data={filteredCustomers} loading={loading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? t('customers.editCustomer') : t('customers.addNewCustomer')}
        size="lg"
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Customers;