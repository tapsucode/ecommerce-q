import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, CheckCircle, Clock, Package, Truck, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Card from '../../components/UI/Card';
import { EnhancedOrder } from '../../types';
import { enhancedOrderService } from '../../services/orderService';
import EnhancedCreateOrderForm from '../../components/Orders/EnhancedCreateOrderForm';

const EnhancedOrders: React.FC = () => {
  const { user, canPerformAction } = useAuth();
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<EnhancedOrder | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    draftOrders: 0,
    confirmedOrders: 0,
    preparingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await enhancedOrderService.getOrders(user?.id, user?.role);
      setOrders(data);
      
      const statsData = await enhancedOrderService.getOrderStats(user?.id, user?.role);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const handleCreateOrder = async (orderData: Partial<EnhancedOrder>) => {
    try {
      await enhancedOrderService.createOrder(orderData);
      setShowCreateModal(false);
      loadOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Không thể tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: EnhancedOrder['status']) => {
    try {
      const result = await enhancedOrderService.updateOrderStatus(orderId, newStatus, user?.id, user?.role);
      if (result) {
        loadOrders();
      } else {
        alert('Bạn không có quyền thực hiện hành động này hoặc trạng thái không hợp lệ.');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.includes(searchTerm) ||
        order.id.includes(searchTerm);
      if (!matchesSearch) return false;
    }
    
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  const getStatusConfig = (status: EnhancedOrder['status']) => {
    const configs = {
      draft: { 
        label: 'Nháp', 
        color: 'bg-gray-100 text-gray-800',
        icon: Clock 
      },
      confirmed: { 
        label: 'Đã xác nhận', 
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle 
      },
      preparing: { 
        label: 'Đang chuẩn bị', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Package 
      },
      shipped: { 
        label: 'Đã giao', 
        color: 'bg-purple-100 text-purple-800',
        icon: Truck 
      },
      delivered: { 
        label: 'Đã nhận', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle 
      },
      cancelled: { 
        label: 'Đã hủy', 
        color: 'bg-red-100 text-red-800',
        icon: X 
      },
    };
    return configs[status] || configs.draft;
  };

  const getAvailableActions = (order: EnhancedOrder) => {
    const actions = [];
    
    // Manager actions
    if (user?.role === 'manager') {
      if (order.status === 'draft') {
        actions.push({
          label: 'Xác nhận',
          action: () => handleStatusUpdate(order.id, 'confirmed'),
          variant: 'success' as const,
        });
        actions.push({
          label: 'Hủy',
          action: () => handleStatusUpdate(order.id, 'cancelled'),
          variant: 'danger' as const,
        });
      }
    }
    
    // Warehouse actions
    if ((user?.role === 'warehouse' || user?.role === 'manager')) {
      if (order.status === 'confirmed') {
        actions.push({
          label: 'Chuẩn bị hàng',
          action: () => handleStatusUpdate(order.id, 'preparing'),
          variant: 'primary' as const,
        });
      }
      if (order.status === 'preparing') {
        actions.push({
          label: 'Giao hàng',
          action: () => handleStatusUpdate(order.id, 'shipped'),
          variant: 'primary' as const,
        });
      }
      if (order.status === 'shipped') {
        actions.push({
          label: 'Đã nhận hàng',
          action: () => handleStatusUpdate(order.id, 'delivered'),
          variant: 'success' as const,
        });
      }
    }
    
    return actions;
  };

  const columns = [
    { key: 'id', label: 'Mã ĐH' },
    { key: 'customer', label: 'Khách hàng' },
    { key: 'salesPerson', label: 'NV Bán hàng' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'total', label: 'Tổng tiền' },
    { key: 'createdAt', label: 'Ngày tạo' },
    { key: 'actions', label: 'Thao tác' },
  ];

  const tableData = filteredOrders.map(order => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;
    const actions = getAvailableActions(order);

    return {
      id: `#${order.id.padStart(3, '0')}`,
      customer: (
        <div>
          <div className="font-medium text-gray-900">{order.customer.name}</div>
          <div className="text-sm text-gray-500">{order.customer.phone}</div>
        </div>
      ),
      salesPerson: (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{order.salesPerson.fullName}</div>
          <div className="text-gray-500">{order.salesPerson.role === 'salesperson' ? 'NV Bán hàng' : 'Quản lý'}</div>
        </div>
      ),
      status: (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </span>
      ),
      total: `₫${order.total.toLocaleString('vi-VN')}`,
      createdAt: new Date(order.createdAt).toLocaleDateString('vi-VN'),
      actions: (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => setSelectedOrder(order)}
            className="text-xs px-2 py-1"
          >
            Xem
          </Button>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              className="text-xs px-2 py-1"
            >
              {action.label}
            </Button>
          ))}
        </div>
      ),
    };
  });

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draftOrders}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                ₫{(stats.totalRevenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Filter className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="text-gray-600">
              {user?.role === 'salesperson' 
                ? 'Quản lý đơn hàng của bạn' 
                : 'Quản lý tất cả đơn hàng trong hệ thống'}
            </p>
          </div>
          {canPerformAction('create_order') && (
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Tạo đơn hàng mới</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng, SĐT, mã đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="preparing">Đang chuẩn bị</option>
            <option value="shipped">Đã giao</option>
            <option value="delivered">Đã nhận</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={tableData}
          loading={loading}
          emptyMessage="Không có đơn hàng nào"
        />
      </Card>

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo đơn hàng mới"
        size="large"
      >
        <EnhancedCreateOrderForm
          onSubmit={handleCreateOrder}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Chi tiết đơn hàng #${selectedOrder.id.padStart(3, '0')}`}
          size="large"
        >
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(() => {
                  const statusConfig = getStatusConfig(selectedOrder.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                        <StatusIcon className="h-4 w-4 mr-2" />
                        {statusConfig.label}
                      </span>
                      {selectedOrder.confirmedAt && (
                        <div className="text-sm text-gray-500">
                          Xác nhận: {new Date(selectedOrder.confirmedAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Customer & Sales Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin khách hàng</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Tên:</strong> {selectedOrder.customer.name}</p>
                  <p><strong>SĐT:</strong> {selectedOrder.customer.phone}</p>
                  {selectedOrder.customer.email && <p><strong>Email:</strong> {selectedOrder.customer.email}</p>}
                  <p><strong>Địa chỉ:</strong> {selectedOrder.customer.address}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Nhân viên bán hàng</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Tên:</strong> {selectedOrder.salesPerson.fullName}</p>
                  <p><strong>Chức vụ:</strong> {selectedOrder.salesPerson.role === 'salesperson' ? 'Nhân viên bán hàng' : 'Quản lý'}</p>
                  <p><strong>Ngày tạo:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Sản phẩm</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">SKU: {item.sku} | Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₫{item.total.toLocaleString('vi-VN')}</p>
                      <p className="text-sm text-gray-600">₫{item.price.toLocaleString('vi-VN')}/sp</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promotion */}
            {selectedOrder.promotion && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Khuyến mãi áp dụng</h3>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800">{selectedOrder.promotion.name}</p>
                  <p className="text-sm text-yellow-600">
                    Giảm: ₫{selectedOrder.discountAmount.toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>₫{selectedOrder.subtotal.toLocaleString('vi-VN')}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-yellow-600">
                    <span>Giảm giá:</span>
                    <span>-₫{selectedOrder.discountAmount.toLocaleString('vi-VN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className={selectedOrder.shippingFee === 0 ? 'text-green-600' : ''}>
                    {selectedOrder.shippingFee === 0 ? 'Miễn phí' : `₫${selectedOrder.shippingFee.toLocaleString('vi-VN')}`}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">₫{selectedOrder.total.toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Ghi chú</h3>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-4">
              <div className="flex space-x-3">
                {getAvailableActions(selectedOrder).map((action, index) => (
                  <Button key={index} variant={action.variant} onClick={action.action}>
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EnhancedOrders;