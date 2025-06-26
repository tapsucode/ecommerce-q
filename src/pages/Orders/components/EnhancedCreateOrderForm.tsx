import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomers } from '../../../hooks/useCustomers';
import { useProducts } from '../../../hooks/useProducts';
import { usePromotions } from '../../../hooks/usePromotions';
import Button from '../../../components/UI/Button';
import { Plus, Trash2, Search, User, Percent } from 'lucide-react';

interface EnhancedCreateOrderFormProps {
  onSubmit: (orderData: any) => void;
  onCancel: () => void;
}

const EnhancedCreateOrderForm: React.FC<EnhancedCreateOrderFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const { customers, createCustomer } = useCustomers();
  const { products } = useProducts();
  const { promotions } = usePromotions();

  const [formData, setFormData] = useState({
    customerId: '',
    channel: 'online',
    currency: 'VND',
    notes: '',
    items: [],
    appliedPromotions: []
  });

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    customerType: 'retail' as 'retail' | 'wholesale'
  });

  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [availablePromotions, setAvailablePromotions] = useState([]);

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

  useEffect(() => {
    // Filter applicable promotions based on current cart
    const cartTotal = calculateSubtotal();
    const applicable = promotions.filter(promotion => {
      if (!promotion.active) return false;
      
      // Check if promotion is currently valid
      const now = new Date();
      const startDate = promotion.startDate ? new Date(promotion.startDate) : null;
      const endDate = promotion.endDate ? new Date(promotion.endDate) : null;
      
      if (startDate && startDate > now) return false;
      if (endDate && endDate < now) return false;
      if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) return false;
      
      // Check conditions
      return promotion.rules.some(rule => {
        if (rule.ruleType === 'condition') {
          const { condition, operator, value } = rule.ruleData;
          if (condition === 'cart_total') {
            const threshold = parseFloat(value);
            switch (operator) {
              case '>=': return cartTotal >= threshold;
              case '>': return cartTotal > threshold;
              case '<=': return cartTotal <= threshold;
              case '<': return cartTotal < threshold;
              case '==': return cartTotal === threshold;
              default: return false;
            }
          }
        }
        return false;
      });
    });
    
    setAvailablePromotions(applicable);
  }, [formData.items, promotions]);

  const handleCustomerSearch = (phone: string) => {
    const existingCustomer = customers.find(c => c.phone === phone);
    if (existingCustomer) {
      setSelectedCustomer(existingCustomer);
      setFormData({ ...formData, customerId: existingCustomer.id });
      setIsNewCustomer(false);
      setCustomerData({
        name: existingCustomer.name,
        phone: existingCustomer.phone,
        email: existingCustomer.email,
        address: existingCustomer.address,
        customerType: existingCustomer.customerType
      });
    } else {
      setSelectedCustomer(null);
      setFormData({ ...formData, customerId: '' });
      setIsNewCustomer(true);
      setCustomerData({
        ...customerData,
        phone: phone
      });
    }
  };

  const addOrderItem = (product) => {
    const existingItemIndex = formData.items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;
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

  const togglePromotion = (promotionId) => {
    const isApplied = formData.appliedPromotions.includes(promotionId);
    if (isApplied) {
      setFormData({
        ...formData,
        appliedPromotions: formData.appliedPromotions.filter(id => id !== promotionId)
      });
    } else {
      setFormData({
        ...formData,
        appliedPromotions: [...formData.appliedPromotions, promotionId]
      });
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    let totalDiscount = 0;
    const subtotal = calculateSubtotal();
    
    formData.appliedPromotions.forEach(promotionId => {
      const promotion = promotions.find(p => p.id === promotionId);
      if (promotion) {
        promotion.rules.forEach(rule => {
          if (rule.ruleType === 'action') {
            const { action, value } = rule.ruleData;
            if (action === 'discount_percentage') {
              totalDiscount += subtotal * (parseFloat(value) / 100);
            } else if (action === 'discount_fixed') {
              totalDiscount += parseFloat(value);
            }
          }
        });
      }
    });
    
    return Math.min(totalDiscount, subtotal);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let customerId = formData.customerId;
    
    // Create new customer if needed
    if (isNewCustomer && customerData.name && customerData.phone) {
      try {
        const newCustomer = await createCustomer({
          ...customerData,
          country: 'Vietnam',
          currency: formData.currency,
          lastOrderAt: undefined
        });
        customerId = newCustomer.id;
      } catch (error) {
        console.error('Failed to create customer:', error);
        return;
      }
    }
    
    const orderData = {
      ...formData,
      customerId,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      customer: isNewCustomer ? customerData : selectedCustomer
    };
    
    onSubmit(orderData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          {t('orders.customerInformation')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customers.phoneNumber')} *
            </label>
            <input
              type="tel"
              required
              value={customerData.phone}
              onChange={(e) => {
                setCustomerData({ ...customerData, phone: e.target.value });
                handleCustomerSearch(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('orders.enterPhoneToSearch')}
            />
            {selectedCustomer && (
              <p className="text-sm text-green-600 mt-1">
                {t('orders.existingCustomerFound')}: {selectedCustomer.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customers.fullName')} *
            </label>
            <input
              type="text"
              required
              value={customerData.name}
              onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isNewCustomer && selectedCustomer}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customers.emailAddress')}
            </label>
            <input
              type="email"
              value={customerData.email}
              onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isNewCustomer && selectedCustomer}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customers.customerType')}
            </label>
            <select
              value={customerData.customerType}
              onChange={(e) => setCustomerData({ ...customerData, customerType: e.target.value as 'retail' | 'wholesale' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isNewCustomer && selectedCustomer}
            >
              <option value="retail">{t('customers.retail')}</option>
              <option value="wholesale">{t('customers.wholesale')}</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('customers.address')} *
          </label>
          <textarea
            rows={2}
            required
            value={customerData.address}
            onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('customers.enterFullAddress')}
            disabled={!isNewCustomer && selectedCustomer}
          />
        </div>
      </div>

      {/* Order Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('common.currency')}
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
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
        </div>
      )}

      {/* Available Promotions */}
      {availablePromotions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Percent className="h-5 w-5 mr-2" />
            {t('orders.availablePromotions')}
          </h3>
          <div className="space-y-2">
            {availablePromotions.map((promotion) => (
              <label key={promotion.id} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <input
                  type="checkbox"
                  checked={formData.appliedPromotions.includes(promotion.id)}
                  onChange={() => togglePromotion(promotion.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{promotion.name}</p>
                  <p className="text-sm text-gray-600">{promotion.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Order Summary */}
      {formData.items.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">{t('orders.orderSummary')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('orders.subtotal')}:</span>
              <span className="font-medium">{calculateSubtotal().toLocaleString()} {formData.currency}</span>
            </div>
            {calculateDiscount() > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t('orders.discount')}:</span>
                <span className="font-medium">-{calculateDiscount().toLocaleString()} {formData.currency}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-blue-600 pt-2 border-t border-blue-200">
              <span>{t('common.total')}:</span>
              <span>{calculateTotal().toLocaleString()} {formData.currency}</span>
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
          disabled={!customerData.name || !customerData.phone || formData.items.length === 0}
        >
          {t('orders.createOrder')}
        </Button>
      </div>
    </form>
  );
};

export default EnhancedCreateOrderForm;