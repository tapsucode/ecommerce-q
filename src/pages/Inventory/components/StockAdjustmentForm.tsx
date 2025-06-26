import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../../../types';
import Button from '../../../components/UI/Button';

interface StockAdjustmentFormProps {
  item: InventoryItem;
  onSubmit: (itemId: string, newStock: number) => void;
  onCancel: () => void;
}

const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({ item, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('set');
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let newStock = item.currentStock;
    
    switch (adjustmentType) {
      case 'set':
        newStock = adjustmentValue;
        break;
      case 'add':
        newStock = item.currentStock + adjustmentValue;
        break;
      case 'subtract':
        newStock = Math.max(0, item.currentStock - adjustmentValue);
        break;
    }
    
    onSubmit(item.id, newStock);
  };

  const getNewStockValue = () => {
    switch (adjustmentType) {
      case 'set':
        return adjustmentValue;
      case 'add':
        return item.currentStock + adjustmentValue;
      case 'subtract':
        return Math.max(0, item.currentStock - adjustmentValue);
      default:
        return item.currentStock;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">{item.productName}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">SKU:</span>
            <span className="ml-2 font-medium">{item.sku}</span>
          </div>
          <div>
            <span className="text-gray-600">{t('inventory.currentStock')}:</span>
            <span className="ml-2 font-medium">{item.currentStock}</span>
          </div>
          <div>
            <span className="text-gray-600">{t('inventory.available')}:</span>
            <span className="ml-2 font-medium">{item.availableStock}</span>
          </div>
          <div>
            <span className="text-gray-600">{t('inventory.reserved')}:</span>
            <span className="ml-2 font-medium">{item.reservedStock}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('inventory.adjustmentType')}
        </label>
        <select
          value={adjustmentType}
          onChange={(e) => setAdjustmentType(e.target.value as 'set' | 'add' | 'subtract')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="set">{t('inventory.setToSpecificValue')}</option>
          <option value="add">{t('inventory.addToCurrentStock')}</option>
          <option value="subtract">{t('inventory.subtractFromCurrentStock')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {adjustmentType === 'set' ? t('inventory.newStockValue') : t('inventory.adjustmentAmount')}
        </label>
        <input
          type="number"
          min="0"
          value={adjustmentValue}
          onChange={(e) => setAdjustmentValue(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{t('inventory.newStockValueWillBe')}:</span>
          <span className="font-bold text-lg text-blue-600">{getNewStockValue()}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">
          {t('inventory.updateStock')}
        </Button>
      </div>
    </form>
  );
};

export default StockAdjustmentForm;