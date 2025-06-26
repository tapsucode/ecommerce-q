import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, User, Phone, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { EnhancedCustomer, EnhancedPromotion, EnhancedOrder } from '../../types';
import Button from '../UI/Button';
import Card from '../UI/Card';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

interface EnhancedCreateOrderFormProps {
  onSubmit: (order: Partial<EnhancedOrder>) => void;
  onCancel: () => void;
}

// Mock data for demonstration
const mockCustomers: EnhancedCustomer[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@email.com',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    phone: '0907654321',
    email: 'tranthib@email.com',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockPromotions: EnhancedPromotion[] = [
  {
    id: '1',
    name: 'Giảm 10% đơn hàng trên 500k',
    type: 'percentage',
    value: 10,
    minOrderAmount: 500000,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Miễn phí vận chuyển',
    type: 'free_shipping',
    value: 0,
    minOrderAmount: 300000,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const EnhancedCreateOrderForm: React.FC<EnhancedCreateOrderFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { user } = useAuth();
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<EnhancedCustomer | null>(null);
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', productId: '', productName: '', sku: '', quantity: 1, price: 0, total: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<EnhancedPromotion | null>(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Search customers by phone number
  const searchResults = mockCustomers.filter(customer =>
    customer.phone.includes(customerSearch) ||
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const shippingFee = appliedPromotion?.type === 'free_shipping' ? 0 : 30000;
  
  let discountAmount = 0;
  if (appliedPromotion) {
    if (appliedPromotion.type === 'percentage') {
      discountAmount = (subtotal * appliedPromotion.value) / 100;
    } else if (appliedPromotion.type === 'fixed_amount') {
      discountAmount = appliedPromotion.value;
    }
  }
  
  const total = subtotal - discountAmount + shippingFee;

  // Auto-apply promotion based on order value
  useEffect(() => {
    const eligiblePromotions = mockPromotions.filter(promo => 
      promo.isActive && 
      (!promo.minOrderAmount || subtotal >= promo.minOrderAmount)
    );
    
    if (eligiblePromotions.length > 0) {
      const bestPromotion = eligiblePromotions.reduce((best, current) => {
        const bestValue = best.type === 'percentage' ? (subtotal * best.value) / 100 : best.value;
        const currentValue = current.type === 'percentage' ? (subtotal * current.value) / 100 : current.value;
        return currentValue > bestValue ? current : best;
      });
      setAppliedPromotion(bestPromotion);
    } else {
      setAppliedPromotion(null);
    }
  }, [subtotal]);

  const handleCustomerSelect = (customer: EnhancedCustomer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.phone);
    setShowCustomerResults(false);
    setIsCreatingCustomer(false);
  };

  const handleCreateNewCustomer = () => {
    if (customerSearch && !selectedCustomer) {
      setNewCustomerData(prev => ({ ...prev, phone: customerSearch }));
      setIsCreatingCustomer(true);
      setShowCustomerResults(false);
    }
  };

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      sku: '',
      quantity: 1,
      price: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let customer = selectedCustomer;
    
    if (!customer && isCreatingCustomer) {
      customer = {
        id: Date.now().toString(),
        ...newCustomerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (!customer || !user) {
      alert('Vui lòng chọn hoặc tạo khách hàng mới');
      return;
    }

    const validItems = items.filter(item => item.productName && item.quantity > 0 && item.price > 0);
    if (validItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm hợp lệ');
      return;
    }

    const orderData: Partial<EnhancedOrder> = {
      customer,
      salesPerson: user,
      status: 'draft',
      items: validItems,
      subtotal,
      discountAmount,
      shippingFee,
      total,
      promotion: appliedPromotion || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(orderData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo đơn hàng mới</h2>
          <p className="text-gray-600">Tìm kiếm khách hàng theo số điện thoại hoặc tạo khách hàng mới</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Search Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm khách hàng
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Nhập số điện thoại khách hàng..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerResults(true);
                  setSelectedCustomer(null);
                  setIsCreatingCustomer(false);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {showCustomerResults && customerSearch && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-gray-600 mb-3">Không tìm thấy khách hàng với số điện thoại này</p>
                    <Button
                      type="button"
                      onClick={handleCreateNewCustomer}
                      className="text-sm"
                    >
                      Tạo khách hàng mới
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedCustomer && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-medium text-gray-900 mb-2">Thông tin khách hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{selectedCustomer.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{selectedCustomer.address}</span>
                </div>
              </div>
            </Card>
          )}

          {isCreatingCustomer && (
            <Card className="p-4 bg-green-50 border-green-200">
              <h3 className="font-medium text-gray-900 mb-4">Tạo khách hàng mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.name}
                    onChange={(e) => setNewCustomerData({...newCustomerData, name: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData({...newCustomerData, phone: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.address}
                    onChange={(e) => setNewCustomerData({...newCustomerData, address: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </Card>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sản phẩm</h3>
              <Button type="button" onClick={handleAddItem} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Thêm sản phẩm</span>
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên sản phẩm
                      </label>
                      <input
                        type="text"
                        required
                        value={item.productName}
                        onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn giá
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thành tiền
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-right">
                          ₫{item.total.toLocaleString('vi-VN')}
                        </div>
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {appliedPromotion && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Khuyến mãi được áp dụng:</span>
                <span className="text-yellow-700">{appliedPromotion.name}</span>
              </div>
            </Card>
          )}

          <Card className="p-4 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-4">Tổng kết đơn hàng</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>₫{subtotal.toLocaleString('vi-VN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-yellow-600">
                  <span>Giảm giá:</span>
                  <span>-₫{discountAmount.toLocaleString('vi-VN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className={shippingFee === 0 ? 'text-green-600' : ''}>
                  {shippingFee === 0 ? 'Miễn phí' : `₫${shippingFee.toLocaleString('vi-VN')}`}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">₫{total.toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </Card>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú đơn hàng
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú cho đơn hàng..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-4 pt-6 border-t">
            <Button type="submit" className="flex-1">
              Tạo đơn hàng
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
              Hủy bỏ
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EnhancedCreateOrderForm;