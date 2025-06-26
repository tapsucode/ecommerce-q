import React, { useState } from 'react';
import Button from '../../../components/UI/Button';
import Modal from '../../../components/UI/Modal';

interface OrderWorkflowActionsProps {
}

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
    } catch (error) {
      console.error('Failed to confirm order:', error);
    } finally {
      setLoading(false);
    }
  };

    setLoading(true);
    try {
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

    setLoading(true);
    try {
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

    setLoading(true);
    try {
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
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

    switch (order.status) {
          actions.push(
            <Button
              key="confirm"
              size="sm"
              onClick={handleConfirmOrder}
              disabled={loading}
              className="mr-2"
            >
              <Check className="h-4 w-4 mr-1" />
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
            </Button>
          );
        break;

      case 'confirmed':
          actions.push(
            <Button
              size="sm"
              disabled={loading}
              className="mr-2"
            >
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
            </Button>
          );
        break;

          actions.push(
            <Button
              size="sm"
              disabled={loading}
              className="mr-2"
            >
            </Button>
          );
        break;

          actions.push(
            <Button
              size="sm"
              disabled={loading}
            >
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
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            </label>
            <input
              type="text"
              required
              value={shipmentData.trackingCode}
              onChange={(e) => setShipmentData({ ...shipmentData, trackingCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            </label>
            <select
              required
              value={shipmentData.shippingProvider}
              onChange={(e) => setShipmentData({ ...shipmentData, shippingProvider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
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
            </label>
            <textarea
              rows={3}
              value={shipmentData.notes}
              onChange={(e) => setShipmentData({ ...shipmentData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsShipmentModalOpen(false)}
              disabled={loading}
            >
            </Button>
            <Button
              onClick={handleShipOrder}
              disabled={loading || !shipmentData.trackingCode || !shipmentData.shippingProvider}
            >
            </Button>
          </div>
        </div>
      </Modal>



      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            </label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <div className="text-sm text-red-800">
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
            </Button>
            <Button
              onClick={handleCancelOrder}
              disabled={loading || !cancelReason.trim()}
              variant="danger"
            >
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderWorkflowActions;