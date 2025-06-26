import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Promotion, PromotionRule } from '../../../types';
import Button from '../../../components/UI/Button';
import { Plus, Trash2 } from 'lucide-react';

interface PromotionFormProps {
  promotion?: Promotion | null;
  onSubmit: (promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  onCancel: () => void;
}

const PromotionForm: React.FC<PromotionFormProps> = ({ promotion, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: promotion?.name || '',
    description: promotion?.description || '',
    type: promotion?.type || 'percentage_discount' as 'percentage_discount' | 'fixed_amount_discount' | 'buy_x_get_y' | 'free_shipping' | 'bundle_discount',
    startDate: promotion?.startDate ? promotion.startDate.split('T')[0] : '',
    endDate: promotion?.endDate ? promotion.endDate.split('T')[0] : '',
    usageLimit: promotion?.usageLimit || undefined,
    active: promotion?.active ?? true,
    rules: promotion?.rules || []
  });

  const [newRule, setNewRule] = useState({
    ruleType: 'condition' as 'condition' | 'action',
    condition: '',
    operator: '',
    value: '',
    action: '',
    actionValue: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const promotionData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    };
    
    onSubmit(promotionData);
  };

  const addRule = () => {
    if (newRule.ruleType === 'condition' && newRule.condition && newRule.operator && newRule.value) {
      const rule: PromotionRule = {
        id: Math.random().toString(36).substr(2, 9),
        ruleType: newRule.ruleType,
        ruleData: {
          condition: newRule.condition,
          operator: newRule.operator,
          value: newRule.value
        },
        priority: formData.rules.length
      };
      
      setFormData({
        ...formData,
        rules: [...formData.rules, rule]
      });
      
      setNewRule({
        ruleType: 'condition',
        condition: '',
        operator: '',
        value: '',
        action: '',
        actionValue: ''
      });
    } else if (newRule.ruleType === 'action' && newRule.action && newRule.actionValue) {
      const rule: PromotionRule = {
        id: Math.random().toString(36).substr(2, 9),
        ruleType: newRule.ruleType,
        ruleData: {
          action: newRule.action,
          value: newRule.actionValue
        },
        priority: formData.rules.length
      };
      
      setFormData({
        ...formData,
        rules: [...formData.rules, rule]
      });
      
      setNewRule({
        ruleType: 'action',
        condition: '',
        operator: '',
        value: '',
        action: '',
        actionValue: ''
      });
    }
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index)
    });
  };

  const promotionTypes = [
    { value: 'percentage_discount', label: t('promotions.types.percentageDiscount') },
    { value: 'fixed_amount_discount', label: t('promotions.types.fixedAmountDiscount') },
    { value: 'buy_x_get_y', label: t('promotions.types.buyXGetY') },
    { value: 'free_shipping', label: t('promotions.types.freeShipping') },
    { value: 'bundle_discount', label: t('promotions.types.bundleDiscount') }
  ];

  const conditionTypes = [
    { value: 'cart_total', label: t('promotions.conditions.cartTotal') },
    { value: 'item_count', label: t('promotions.conditions.itemCount') },
    { value: 'customer_type', label: t('promotions.conditions.customerType') },
    { value: 'product_category', label: t('promotions.conditions.productCategory') }
  ];

  const operators = [
    { value: '>=', label: t('promotions.operators.greaterThanOrEqual') },
    { value: '>', label: t('promotions.operators.greaterThan') },
    { value: '<=', label: t('promotions.operators.lessThanOrEqual') },
    { value: '<', label: t('promotions.operators.lessThan') },
    { value: '==', label: t('promotions.operators.equals') },
    { value: 'in', label: t('promotions.operators.in') }
  ];

  const actionTypes = [
    { value: 'discount_percentage', label: t('promotions.actions.discountPercentage') },
    { value: 'discount_fixed', label: t('promotions.actions.discountFixed') },
    { value: 'free_shipping', label: t('promotions.actions.freeShipping') }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('promotions.name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('promotions.enterName')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('promotions.type')} <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {promotionTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('promotions.startDate')}
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('promotions.endDate')}
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('promotions.usageLimit')}
          </label>
          <input
            type="number"
            min="1"
            value={formData.usageLimit || ''}
            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('promotions.noLimit')}
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{t('promotions.active')}</span>
          </label>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('common.description')}
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('promotions.enterDescription')}
        />
      </div>

      {/* Promotion Rules */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{t('promotions.rules')}</h3>
        </div>

        {/* Existing Rules */}
        {formData.rules.length > 0 && (
          <div className="space-y-3 mb-4">
            {formData.rules.map((rule, index) => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900 capitalize">{rule.ruleType}</span>
                  <div className="text-sm text-gray-600">
                    {rule.ruleType === 'condition' ? (
                      <>
                        {rule.ruleData.condition} {rule.ruleData.operator} {rule.ruleData.value}
                      </>
                    ) : (
                      <>
                        {rule.ruleData.action}: {rule.ruleData.value}
                      </>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Rule */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">{t('promotions.addRule')}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('promotions.ruleType')}
              </label>
              <select
                value={newRule.ruleType}
                onChange={(e) => setNewRule({ ...newRule, ruleType: e.target.value as 'condition' | 'action' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="condition">{t('promotions.condition')}</option>
                <option value="action">{t('promotions.action')}</option>
              </select>
            </div>

            {newRule.ruleType === 'condition' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('promotions.condition')}
                  </label>
                  <select
                    value={newRule.condition}
                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('common.select')}</option>
                    {conditionTypes.map((condition) => (
                      <option key={condition.value} value={condition.value}>{condition.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('promotions.operator')}
                  </label>
                  <select
                    value={newRule.operator}
                    onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('common.select')}</option>
                    {operators.map((operator) => (
                      <option key={operator.value} value={operator.value}>{operator.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('promotions.value')}
                  </label>
                  <input
                    type="text"
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('promotions.enterValue')}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('promotions.action')}
                  </label>
                  <select
                    value={newRule.action}
                    onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('common.select')}</option>
                    {actionTypes.map((action) => (
                      <option key={action.value} value={action.value}>{action.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('promotions.value')}
                  </label>
                  <input
                    type="text"
                    value={newRule.actionValue}
                    onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('promotions.enterValue')}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4">
            <Button
              type="button"
              onClick={addRule}
              disabled={
                newRule.ruleType === 'condition' 
                  ? !newRule.condition || !newRule.operator || !newRule.value
                  : !newRule.action || !newRule.actionValue
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('promotions.addRule')}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">
          {promotion ? t('promotions.updatePromotion') : t('promotions.createPromotion')}
        </Button>
      </div>
    </form>
  );
};

export default PromotionForm;