import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomers } from '../../../hooks/useCustomers';
import { useProducts } from '../../../hooks/useProducts';
import Button from '../../../components/UI/Button';
import { Plus, Trash2, Search } from 'lucide-react';

interface CreateOrderFormProps {
  onSubmit: (orderData: any) => void;
  onCancel: () => void;
}

const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const { customers } = useCustomers();
  const { products } = useProducts();

  const [formData, setFormData] = useState({
    customerId: '',
    channel: 'online',
    currency: 'VND',
    notes: '',
    items: []
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered.slice(0, 10));
    } else {
      setFilteredProducts([]);
    }
  }, [productSearch, products]);

  const addOrderItem = (product) => {
    const existingItemIndex = formData.items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      setFormData({ ...formData, items: updatedItems });
    } else {
      const newItem = {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        price: product.price,
        quantity: 1,
        total: product.price
      };
      setFormData({ ...formData, items: [...formData.items, newItem] });
    }
    setProductSearch('');
    setFilteredProducts([]);
  };

  const updateItemQuantity = (index, quantity) => {
    const updatedItems = [...formData.items];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total = updatedItems[index].price * quantity;
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const orderData = {
      ...formData,
      total: calculateTotal(),
      customer: selectedCustomer
    };
    
    onSubmit(orderData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('orders.customer')} *
          </label>
          <select
            required
            value={formData.customerId}
            onChange={(e) => {
              const customer = customers.find(c => c.id === e.target.value);
              setFormData({ ...formData, customerId: e.target.value });
              setSelectedCustomer(customer);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('orders.selectCustomer')}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('orders.channel')}
          </label>
          <select
            value={formData.channel}
            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="online">{t('orders.online')}</option>
            <option value="retail">{t('orders.retail')}</option>
            <option value="wholesale">{t('orders.wholesale')}</option>
          </select>
        </div>
      </div>

      {/* Product Search and Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('orders.addProducts')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('orders.searchProducts')}
          />
          
          {filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addOrderItem(product)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{product.price.toLocaleString()} {product.currency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      {formData.items.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('orders.orderItems')}</h3>
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">{t('common.quantity')}:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {item.total.toLocaleString()} {formData.currency}
                  </p>
                </div>
                
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">{t('common.total')}:</span>
              <span className="text-xl font-bold text-blue-600">
                {calculateTotal().toLocaleString()} {formData.currency}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('orders.notes')}
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('orders.enterNotes')}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button 
          type="submit" 
          disabled={!formData.customerId || formData.items.length === 0}
        >
          {t('orders.createOrder')}
        </Button>
      </div>
    </form>
  );
};

export default CreateOrderForm;