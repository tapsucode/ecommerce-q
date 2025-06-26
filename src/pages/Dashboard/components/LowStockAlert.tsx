import React from 'react';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../../../types';
import { AlertTriangle } from 'lucide-react';

interface LowStockAlertProps {
  items: InventoryItem[];
  loading: boolean;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ items, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item) => (
        <div key={item.id} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
            <p className="text-xs text-gray-600">SKU: {item.sku}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-orange-700">{item.availableStock} còn lại</p>
            <p className="text-xs text-gray-500">Đặt lại ở {item.reorderLevel}</p>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center py-4">
          <div className="text-emerald-600 mb-2">
            <AlertTriangle className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-sm text-emerald-700 font-medium">{t('dashboard.allItemsWellStocked')}</p>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;