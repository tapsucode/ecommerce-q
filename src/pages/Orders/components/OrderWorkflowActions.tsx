import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Order } from '../../../types';
import Button from '../../../components/UI/Button';
import Modal from '../../../components/UI/Modal';
import { Check, Truck, Package, RotateCcw, X, AlertTriangle } from 'lucide-react';

interface OrderWorkflowActionsProps {
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
}

const OrderWorkflowActions: React.FC<OrderWorkflowActionsProps> = ({ order, onOrderUpdate }) => {
  const { t } = useTranslation();
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shipmentData, setShipmentData] = useState({
    trackingCode: '',
    shippingProvider: '',
    shippingFee: 0,
    notes: ''
  });

  const [returnData, setReturnData] = useState({
    reason: 'CUSTOMER_CHANGE_MIND',
    condition: 'NEW',
    notes: '',
    items: []
  });

  const [cancelReason, setCancelReason] = useState('');

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/order-workflow/${order.id}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        onOrderUpdate(updatedOrder);
      }
    } catch (error) {
      console.error('Failed to confirm order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/order-workflow/${order.id}/ship`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipmentData)
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        onOrderUpdate(updatedOrder);
        setIsShipmentModalOpen(false);
        setShipmentData({ trackingCode: '', shippingProvider: '', shippingFee: 0, notes: '' });
      }
    } catch (error) {
      console.error('Failed to ship order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/order-workflow/${order.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        onOrderUpdate(updatedOrder);
      }
    } catch (error) {
      console.error('Failed to complete order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReturn = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/order-workflow/${order.id}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(returnData)
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        onOrderUpdate(updatedOrder);
        setIsReturnModalOpen(false);
        setReturnData({ reason: 'CUSTOMER_CHANGE_MIND', condition: 'NEW', notes: '', items: [] });
      }
    } catch (error) {
      console.error('Failed to process return:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/order-workflow/${order.id}/cancel?reason=${encodeURIComponent(cancelReason)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        onOrderUpdate(updatedOrder);
        setIsCancelModalOpen(false);
        setCancelReason('');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];

    switch (order.status) {
      case 'pending':
        actions.push(
          <Button
            key="confirm"
            size="sm"
            onClick={handleConfirmOrder}
            disabled={loading}
            className="mr-2"
          >
            <Check className="h-4 w-4 mr-1" />
            {t('orders.workflow.confirm')}
          </Button>
        );
        actions.push(
          <Button
            key="cancel"
            size="sm"
            variant="danger"
            onClick={() => setIsCancelModalOpen(true)}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-1" />
            {t('orders.workflow.cancel')}
          </Button>
        );
        break;

      case 'confirmed':
        actions.push(
          <Button
            key="ship"
            size="sm"
            onClick={() => setIsShipmentModalOpen(true)}
            disabled={loading}
            className="mr-2"
          >
            <Truck className="h-4 w-4 mr-1" />
            {t('orders.workflow.ship')}
          </Button>
        );
        actions.push(
          <Button
            key="cancel"
            size="sm"
            variant="danger"
            onClick={() => setIsCancelModalOpen(true)}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-1" />
            {t('orders.workflow.cancel')}
          </Button>
        );
        break;

      case 'shipped':
        actions.push(
          <Button
            key="complete"
            size="sm"
            variant="success"
            onClick={handleCompleteOrder}
            disabled={loading}
            className="mr-2"
          >
            <Package className="h-4 w-4 mr-1" />
            {t('orders.workflow.complete')}
          </Button>
        );
        actions.push(
          <Button
            key="return"
            size="sm"
            variant="secondary"
            onClick={() => setIsReturnModalOpen(true)}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            {t('orders.workflow.processReturn')}
          </Button>
        );
        break;

      case 'completed':
        actions.push(
          <Button
            key="return"
            size="sm"
            variant="secondary"
            onClick={() => setIsReturnModalOpen(true)}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            {t('orders.workflow.processReturn')}
          </Button>
        );
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
        title={t('orders.workflow.shipOrder')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('orders.workflow.trackingCode')} *
            </label>
            <input
              type="text"
              required
              value={shipmentData.trackingCode}
              onChange={(e) => setShipmentData({ ...shipmentData, trackingCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('orders.workflow.enterTrackingCode')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('orders.workflow.shippingProvider')} *
            </label>
            <select
              required
              value={shipmentData.shippingProvider}
              onChange={(e) => setShipmentData({ ...shipmentData, shippingProvider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('orders.workflow.selectProvider')}</option>
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
              {t('orders.workflow.shippingFee')}
            </label>
            <input
              type="number"
              step="0.01"
              value={shipmentData.shippingFee}
              onChange={(e) => setShipmentData({ ...shipmentData, shippingFee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('orders.workflow.notes')}
            </label>
            <textarea
              rows={3}
              value={shipmentData.notes}
              onChange={(e) => setShipmentData({ ...shipmentData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('orders.workflow.enterNotes')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsShipmentModalOpen(false)}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleShipOrder}
              disabled={loading || !shipmentData.trackingCode || !shipmentData.shippingProvider}
            >
              {loading ? t('common.processing') : t('orders.workflow.confirmShipment')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title={t('orders.workflow.processReturn')}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('orders.workflow.returnReason')} *
              </label>
              <select
                required
                value={returnData.reason}
                onChange={(e) => setReturnData({ ...returnData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DAMAGED">{t('orders.workflow.reasons.damaged')}</option>
                <option value="WRONG_ITEM">{t('orders.workflow.reasons.wrongItem')}</option>
                <option value="CUSTOMER_CHANGE_MIND">{t('orders.workflow.reasons.changeMind')}</option>
                <option value="QUALITY_ISSUE">{t('orders.workflow.reasons.qualityIssue')}</option>
                <option value="OTHER">{t('orders.workflow.reasons.other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('orders.workflow.itemCondition')} *
              </label>
              <select
                required
                value={returnData.condition}
                onChange={(e) => setReturnData({ ...returnData, condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NEW">{t('orders.workflow.conditions.new')}</option>
                <option value="USED">{t('orders.workflow.conditions.used')}</option>
                <option value="DAMAGED">{t('orders.workflow.conditions.damaged')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('orders.workflow.returnNotes')}
            </label>
            <textarea
              rows={3}
              value={returnData.notes}
              onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('orders.workflow.enterReturnNotes')}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">{t('orders.workflow.returnWarning')}</p>
                <p className="mt-1">{t('orders.workflow.returnWarningText')}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsReturnModalOpen(false)}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleProcessReturn}
              disabled={loading}
              variant="secondary"
            >
              {loading ? t('common.processing') : t('orders.workflow.confirmReturn')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={t('orders.workflow.cancelOrder')}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('orders.workflow.cancelReason')} *
            </label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('orders.workflow.enterCancelReason')}
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <div className="text-sm text-red-800">
                <p className="font-medium">{t('orders.workflow.cancelWarning')}</p>
                <p className="mt-1">{t('orders.workflow.cancelWarningText')}</p>
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
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCancelOrder}
              disabled={loading || !cancelReason.trim()}
              variant="danger"
            >
              {loading ? t('common.processing') : t('orders.workflow.confirmCancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderWorkflowActions;