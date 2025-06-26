import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSuppliers } from '../../hooks/useSuppliers';
import { Search, Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';
import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import SupplierForm from './components/SupplierForm';
import { Supplier } from '../../types';

const Suppliers: React.FC = () => {
  const { t } = useTranslation();
  const { suppliers, loading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createSupplier(supplierData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  const handleUpdateSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingSupplier) return;
    try {
      await updateSupplier(editingSupplier.id, supplierData);
      setEditingSupplier(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm(t('suppliers.deleteConfirm'))) {
      try {
        await deleteSupplier(id);
      } catch (error) {
        console.error('Failed to delete supplier:', error);
      }
    }
  };

  const columns = [
    {
      key: 'name',
      title: t('suppliers.supplierName'),
      render: (value: string, record: Supplier) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          {record.contactPerson && (
            <p className="text-sm text-gray-500">{t('suppliers.contactPerson')}: {record.contactPerson}</p>
          )}
        </div>
      ),
    },
    {
      key: 'contactInfo',
      title: t('suppliers.contactInfo'),
      render: (value: any, record: Supplier) => (
        <div className="space-y-1">
          {record.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-3 w-3 mr-1" />
              {record.email}
            </div>
          )}
          {record.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-3 w-3 mr-1" />
              {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'address',
      title: t('customers.address'),
      render: (value: string) => (
        <span className="text-sm text-gray-600 truncate max-w-xs block">{value}</span>
      ),
    },
    {
      key: 'paymentTerms',
      title: t('suppliers.paymentTerms'),
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || '-'}</span>
      ),
    },
    {
      key: 'active',
      title: t('common.status'),
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? t('common.active') : t('common.inactive')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (value: any, record: Supplier) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditingSupplier(record);
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteSupplier(record.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const supplierStats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.active).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('suppliers.title')}</h1>
          <p className="text-gray-600 mt-2">{t('suppliers.subtitle')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('suppliers.addSupplier')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{supplierStats.total}</div>
            <div className="text-sm text-gray-600">{t('suppliers.totalSuppliers')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{supplierStats.active}</div>
            <div className="text-sm text-gray-600">{t('suppliers.activeSuppliers')}</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('suppliers.searchSuppliers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <Table columns={columns} data={filteredSuppliers} loading={loading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier ? t('suppliers.editSupplier') : t('suppliers.addNewSupplier')}
        size="lg"
      >
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={editingSupplier ? handleUpdateSupplier : handleCreateSupplier}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingSupplier(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Suppliers;