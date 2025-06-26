import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { EnhancedOrder } from '../../../types';
import Button from '../../../components/UI/Button';
import Modal from '../../../components/UI/Modal';
import { Check, Truck, Package, X, AlertTriangle } from 'lucide-react';

interface OrderWorkflowActionsProps {
  order: EnhancedOrder;
  onConfirm: (orderId: string) => Promise<void>;
  onCancel: (orderId: string, reason: string) => Promise<void>;
  onWorkflowUpdate: (orderId: string, status: EnhancedOrder['status'], data?: any) => Promise<void>;
}

const OrderWorkflowActions: React.FC<OrderWorkflowActionsProps> = ({ 
  order, 
  onConfirm, 
  onCancel, 
  onWorkflowUpdate 
}) => {
  const { user, canPerformAction } = useAuth();
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shipmentData, setShipmentData] = useState({
    trackingCode: '',
    shippingProvider: '',
    notes: ''
  });

  const [cancelReason, setCancelReason] = useState('');

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      await onConfirm(order.id);
    } catch (error) {
      console.error('Failed to confirm order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareOrder = async () => {
    setLoading(true);
    try {
      await onWorkflowUpdate(order.id, 'preparing');
    } catch (error) {
      console.error('Failed to prepare order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async () => {
    setLoading(true);
    try {
      await onWorkflowUpdate(order.id, 'shipped', shipmentData);
      setIsShipmentModalOpen(false);
      setShipmentData({ trackingCode: '', shippingProvider: '', notes: '' });
    } catch (error) {
      console.error('Failed to ship order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverOrder = async () => {
    setLoading(true);
    try {
      await onWorkflowUpdate(order.id, 'delivered');
    } catch (error) {
      console.error('Failed to deliver order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      await onCancel(order.id, cancelReason);
      setIsCancelModalOpen(false);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    // Check permissions for different actions
    const canConfirm = canPerformAction('confirm_order');
    const canCancel = canPerformAction('cancel_order');
    const canPrepare = canPerformAction('manage_inventory') || user?.role === 'warehouse' || user?.role === 'manager';
    const canShip = canPrepare;

    switch (order.status) {
      case 'draft':
        if (canConfirm) {
          actions.push(
            <Button
              key="confirm"
              size="sm"
              onClick={handleConfirmOrder}
              disabled={loading}
              className="mr-2"
            >
              <Check className="h-4 w-4 mr-1" />
              Xác nhận
            </Button>
          );
        }
        if (canCancel) {
          actions.push(
            <Button
              key="cancel"
              size="sm"
              variant="danger"
              onClick={() => setIsCancelModalOpen(true)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" />
              Hủy
            </Button>
          );
        }
        break;

      case 'confirmed':
        if (canPrepare) {
          actions.push(
            <Button
              key="prepare"
              size="sm"
              onClick={handlePrepareOrder}
              disabled={loading}
              className="mr-2"
            >
              <Package className="h-4 w-4 mr-1" />
              Chuẩn bị
            </Button>
          );
        }
        if (canCancel) {
          actions.push(
            <Button
              key="cancel"
              size="sm"
              variant="danger"
              onClick={() => setIsCancelModalOpen(true)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" />
              Hủy
            </Button>
          );
        }
        break;

      case 'preparing':
        if (canShip) {
          actions.push(
            <Button
              key="ship"
              size="sm"
              onClick={() => setIsShipmentModalOpen(true)}
              disabled={loading}
              className="mr-2"
            >
              <Truck className="h-4 w-4 mr-1" />
              Giao hàng
            </Button>
          );
        }
        break;

      case 'shipped':
        if (canShip) {
          actions.push(
            <Button
              key="deliver"
              size="sm"
              variant="success"
              onClick={handleDeliverOrder}
              disabled={loading}
            >
              <Check className="h-4 w-4 mr-1" />
              Đã giao
            </Button>
          );
        }
        break;
    }

    return actions;
  };

  return (
    <div className="flex items-center space-x-2">
      {getAvailableActions()}

      {/* Shipment Modal */}
      <Modal
        isOpen={isShipmentModalOpen}
        onClose={() => setIsShipmentModalOpen(false)}
        title="Giao hàng"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã vận đơn *
            </label>
            <input
              type="text"
              required
              value={shipmentData.trackingCode}
              onChange={(e) => setShipmentData({ ...shipmentData, trackingCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mã vận đơn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đơn vị vận chuyển *
            </label>
            <select
              required
              value={shipmentData.shippingProvider}
              onChange={(e) => setShipmentData({ ...shipmentData, shippingProvider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn đơn vị vận chuyển</option>
              <option value="Giao Hàng Nhanh">Giao Hàng Nhanh</option>
              <option value="Giao Hàng Tiết Kiệm">Giao Hàng Tiết Kiệm</option>
              <option value="Viettel Post">Viettel Post</option>
              <option value="Vietnam Post">Vietnam Post</option>
              <option value="J&T Express">J&T Express</option>
              <option value="Shopee Express">Shopee Express</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              rows={3}
              value={shipmentData.notes}
              onChange={(e) => setShipmentData({ ...shipmentData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập ghi chú"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsShipmentModalOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleShipOrder}
              disabled={loading || !shipmentData.trackingCode || !shipmentData.shippingProvider}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận giao hàng'}
            </Button>
          </div>
        </div>
      </Modal>



      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Hủy đơn hàng"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do hủy *
            </label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập lý do hủy đơn hàng"
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Cảnh báo</p>
                <p className="mt-1">Việc hủy đơn hàng không thể hoàn tác. Vui lòng xác nhận thông tin trước khi thực hiện.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={loading}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleCancelOrder}
              disabled={loading || !cancelReason.trim()}
              variant="danger"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderWorkflowActions;