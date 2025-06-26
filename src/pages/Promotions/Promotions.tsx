import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePromotions } from '../../hooks/usePromotions';
import { Search, Plus, Edit, Trash2, Calendar, Percent, DollarSign } from 'lucide-react';
import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import PromotionForm from './components/PromotionForm';
import { Promotion } from '../../types';
import { format } from 'date-fns';

const Promotions: React.FC = () => {
  const { t } = useTranslation();
  const { promotions, loading, createPromotion, updatePromotion, deletePromotion } = usePromotions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = 
      promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const startDate = promotion.startDate ? new Date(promotion.startDate) : null;
    const endDate = promotion.endDate ? new Date(promotion.endDate) : null;
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = promotion.active && 
        (!startDate || startDate <= now) && 
        (!endDate || endDate >= now);
    } else if (statusFilter === 'expired') {
      matchesStatus = endDate && endDate < now;
    } else if (statusFilter === 'scheduled') {
      matchesStatus = startDate && startDate > now;
    } else if (statusFilter === 'inactive') {
      matchesStatus = !promotion.active;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleCreatePromotion = async (promotionData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    try {
      await createPromotion(promotionData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create promotion:', error);
    }
  };

  const handleUpdatePromotion = async (promotionData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    if (!editingPromotion) return;
    try {
      await updatePromotion(editingPromotion.id, promotionData);
      setEditingPromotion(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update promotion:', error);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (window.confirm(t('promotions.deleteConfirm'))) {
      try {
        await deletePromotion(id);
      } catch (error) {
        console.error('Failed to delete promotion:', error);
      }
    }
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const startDate = promotion.startDate ? new Date(promotion.startDate) : null;
    const endDate = promotion.endDate ? new Date(promotion.endDate) : null;

    if (!promotion.active) {
      return { status: t('promotions.inactive'), color: 'bg-gray-100 text-gray-800' };
    }

    if (startDate && startDate > now) {
      return { status: t('promotions.scheduled'), color: 'bg-blue-100 text-blue-800' };
    }

    if (endDate && endDate < now) {
      return { status: t('promotions.expired'), color: 'bg-red-100 text-red-800' };
    }

    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return { status: t('promotions.limitReached'), color: 'bg-orange-100 text-orange-800' };
    }

    return { status: t('promotions.active'), color: 'bg-green-100 text-green-800' };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage_discount':
        return <Percent className="h-4 w-4" />;
      case 'fixed_amount_discount':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      key: 'name',
      title: t('promotions.name'),
      render: (value: string, record: Promotion) => (
        <div>
          <div className="flex items-center space-x-2">
            {getTypeIcon(record.type)}
            <span className="font-medium text-gray-900">{value}</span>
          </div>
          <p className="text-sm text-gray-500">{record.description}</p>
        </div>
      ),
    },
    {
      key: 'type',
      title: t('promotions.type'),
      render: (value: string) => (
        <span className="text-sm text-gray-600 capitalize">
          {t(`promotions.types.${value}`)}
        </span>
      ),
    },
    {
      key: 'period',
      title: t('promotions.period'),
      render: (value: any, record: Promotion) => (
        <div className="text-sm">
          {record.startDate && (
            <div>
              <span className="text-gray-600">{t('promotions.from')}: </span>
              <span>{format(new Date(record.startDate), 'dd/MM/yyyy')}</span>
            </div>
          )}
          {record.endDate && (
            <div>
              <span className="text-gray-600">{t('promotions.to')}: </span>
              <span>{format(new Date(record.endDate), 'dd/MM/yyyy')}</span>
            </div>
          )}
          {!record.startDate && !record.endDate && (
            <span className="text-gray-500">{t('promotions.noTimeLimit')}</span>
          )}
        </div>
      ),
    },
    {
      key: 'usage',
      title: t('promotions.usage'),
      render: (value: any, record: Promotion) => (
        <div className="text-sm">
          <div>
            <span className="font-medium">{record.usageCount}</span>
            {record.usageLimit && <span className="text-gray-500"> / {record.usageLimit}</span>}
          </div>
          {record.usageLimit && (
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div
                className="bg-blue-600 h-1 rounded-full"
                style={{ width: `${Math.min((record.usageCount / record.usageLimit) * 100, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: t('common.status'),
      render: (value: any, record: Promotion) => {
        const { status, color } = getPromotionStatus(record);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (value: any, record: Promotion) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditingPromotion(record);
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeletePromotion(record.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const promotionStats = {
    total: promotions.length,
    active: promotions.filter(p => {
      const now = new Date();
      const startDate = p.startDate ? new Date(p.startDate) : null;
      const endDate = p.endDate ? new Date(p.endDate) : null;
      return p.active && (!startDate || startDate <= now) && (!endDate || endDate >= now);
    }).length,
    scheduled: promotions.filter(p => {
      const startDate = p.startDate ? new Date(p.startDate) : null;
      return startDate && startDate > new Date();
    }).length,
    expired: promotions.filter(p => {
      const endDate = p.endDate ? new Date(p.endDate) : null;
      return endDate && endDate < new Date();
    }).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('promotions.title')}</h1>
          <p className="text-gray-600 mt-2">{t('promotions.subtitle')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('promotions.addPromotion')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{promotionStats.total}</div>
            <div className="text-sm text-gray-600">{t('promotions.totalPromotions')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{promotionStats.active}</div>
            <div className="text-sm text-gray-600">{t('promotions.activePromotions')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{promotionStats.scheduled}</div>
            <div className="text-sm text-gray-600">{t('promotions.scheduledPromotions')}</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{promotionStats.expired}</div>
            <div className="text-sm text-gray-600">{t('promotions.expiredPromotions')}</div>
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
              placeholder={t('promotions.searchPromotions')}
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
            <option value="all">{t('promotions.allStatus')}</option>
            <option value="active">{t('promotions.active')}</option>
            <option value="scheduled">{t('promotions.scheduled')}</option>
            <option value="expired">{t('promotions.expired')}</option>
            <option value="inactive">{t('promotions.inactive')}</option>
          </select>
        </div>

        <Table columns={columns} data={filteredPromotions} loading={loading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPromotion(null);
        }}
        title={editingPromotion ? t('promotions.editPromotion') : t('promotions.addNewPromotion')}
        size="lg"
      >
        <PromotionForm
          promotion={editingPromotion}
          onSubmit={editingPromotion ? handleUpdatePromotion : handleCreatePromotion}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPromotion(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Promotions;