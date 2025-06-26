import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSuppliers } from '../../../hooks/useSuppliers';
import { useProducts } from '../../../hooks/useProducts';
import { PurchaseOrder } from '../../../types';
import Button from '../../../components/UI/Button';
import { Plus, Trash2, Search } from 'lucide-react';

interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder | null;
  onSubmit: (purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ purchaseOrder, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const { suppliers } = useSuppliers();
  const { products } = useProducts();

  const [formData, setFormData] = useState({
    poNumber: purchaseOrder?.poNumber || '',
    supplierId: purchaseOrder?.supplier?.id || '',
    orderDate: purchaseOrder?.orderDate ? purchaseOrder.orderDate.split('T')[0] : new Date().toISOString().split('T')[0],
    expectedDeliveryDate: purchaseOrder?.expectedDeliveryDate ? purchaseOrder.expectedDeliveryDate.split('T')[0] : '',
    status: purchaseOrder?.status || 'draft' as 'draft' | 'ordered' | 'partially_received' | 'completed' | 'cancelled',
    notes: purchaseOrder?.notes || '',
    items: purchaseOrder?.items || []
  });

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

  useEffect(() => {
    if (!formData.poNumber && !purchaseOrder) {
      // Generate PO number
      const poNumber = `PO-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, poNumber }));
    }
  }, []);

  const addOrderItem = (product) => {
    const existingItemIndex = formData.items.findIndex(item => item.product?.id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      setFormData({ ...formData, items: updatedItems });
    } else {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        product: product,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        costPrice: product.cost,
        receivedQuantity: 0
      };
      setFormData({ ...formData, items: [...formData.items, newItem] });
    }
    setProductSearch('');
    setFilteredProducts([]);
  };

  const updateItemQuantity = (index, quantity) => {
    const updatedItems = [...formData.items];
    updatedItems[index].quantity = quantity;
    setFormData({ ...formData, items: updatedItems });
  };

  const updateItemCostPrice = (index, costPrice) => {
    const updatedItems = [...formData.items];
    updatedItems[index].costPrice = costPrice;
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotalCost = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
    if (!selectedSupplier) return;

    const purchaseOrderData = {
      ...formData,
      supplier: selectedSupplier,
      totalCost: calculateTotalCost(),
      createdBy: 'current-user-id' // This should come from auth context
    };
    
    onSubmit(purchaseOrderData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('purchaseOrders.poNumber')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.poNumber}
            onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="PO-000001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('purchaseOrders.supplier')} <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.supplierId}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('common.select')}</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('common.status')}
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">{t('purchaseOrders.draft')}</option>
            <option value="ordered">{t('purchaseOrders.ordered')}</option>
            <option value="partially_received">{t('purchaseOrders.partiallyReceived')}</option>
            <option value="completed">{t('purchaseOrders.completed')}</option>
            <option value="cancelled">{t('purchaseOrders.cancelled')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('purchaseOrders.orderDate')} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.orderDate}
            onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('purchaseOrders.expectedDelivery')}
          </label>
          <input
            type="date"
            value={formData.expectedDeliveryDate}
            onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
                      <p className="font-semibold text-gray-900">{product.cost.toLocaleString()} VND</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Order Items */}
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

                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">{t('common.cost')}:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.costPrice}
                    onChange={(e) => updateItemCostPrice(index, parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {(item.quantity * item.costPrice).toLocaleString()} VND
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
              <span className="text-lg font-medium text-gray-900">{t('purchaseOrders.totalCost')}:</span>
              <span className="text-xl font-bold text-blue-600">
                {calculateTotalCost().toLocaleString()} VND
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
          disabled={!formData.supplierId || formData.items.length === 0}
        >
          {purchaseOrder ? t('purchaseOrders.updatePurchaseOrder') : t('purchaseOrders.createPurchaseOrder')}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;