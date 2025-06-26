import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Customer } from '../../../types';
import Button from '../../../components/UI/Button';

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    country: customer?.country || '',
    customerType: customer?.customerType || 'retail' as 'retail' | 'wholesale',
    currency: customer?.currency || 'USD',
    lastOrderAt: customer?.lastOrderAt
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const countries = [
    { value: 'United States', label: t('countries.unitedStates') },
    { value: 'Canada', label: t('countries.canada') },
    { value: 'United Kingdom', label: t('countries.unitedKingdom') },
    { value: 'Germany', label: t('countries.germany') },
    { value: 'France', label: t('countries.france') },
    { value: 'Japan', label: t('countries.japan') },
    { value: 'Australia', label: t('countries.australia') },
    { value: 'Singapore', label: t('countries.singapore') },
    { value: 'Vietnam', label: t('countries.vietnam') },
    { value: 'Thailand', label: t('countries.thailand') },
    { value: 'Indonesia', label: t('countries.indonesia') },
    { value: 'Malaysia', label: t('countries.malaysia') },
    { value: 'Philippines', label: t('countries.philippines') },
    { value: 'South Korea', label: t('countries.southKorea') },
    { value: 'China', label: t('countries.china') }
  ];

  const currencies = [
    { value: 'USD', label: t('currencies.usd') },
    { value: 'EUR', label: t('currencies.eur') },
    { value: 'GBP', label: t('currencies.gbp') },
    { value: 'JPY', label: t('currencies.jpy') },
    { value: 'VND', label: t('currencies.vnd') },
    { value: 'SGD', label: t('currencies.sgd') }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('customers.fullName')}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('customers.emailAddress')}
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('customers.phoneNumber')}
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('customers.country')}
          </label>
          <select
            required
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('customers.selectCountry')}</option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>{country.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('customers.customerType')}
          </label>
          <select
            value={formData.customerType}
            onChange={(e) => setFormData({ ...formData, customerType: e.target.value as 'retail' | 'wholesale' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="retail">{t('customers.retail')}</option>
            <option value="wholesale">{t('customers.wholesale')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('common.currency')}
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map((currency) => (
              <option key={currency.value} value={currency.value}>{currency.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('customers.address')}
        </label>
        <textarea
          rows={3}
          required
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('customers.enterFullAddress')}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">
          {customer ? t('customers.updateCustomer') : t('customers.createCustomer')}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;