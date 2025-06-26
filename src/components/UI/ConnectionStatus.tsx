
import React, { useState, useEffect } from 'react';
import { serviceFactory } from '../../services/serviceFactory';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [serviceStatus, setServiceStatus] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setServiceStatus(serviceFactory.getServiceStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const backendCount = Object.values(serviceStatus).filter(status => status === 'backend').length;
  const mockCount = Object.values(serviceStatus).filter(status => status === 'mock').length;

  const handleToggleMode = () => {
    if (backendCount > mockCount) {
      serviceFactory.switchToMockMode();
    } else {
      serviceFactory.switchToBackendMode();
    }
    setServiceStatus(serviceFactory.getServiceStatus());
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm p-3 ${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            backendCount > 0 ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm font-medium">
            {backendCount > 0 ? 'Backend Connected' : 'Mock Mode'}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleMode();
          }}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Toggle
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-1">
          <div className="text-xs text-gray-600 font-medium">Service Status:</div>
          {Object.entries(serviceStatus).map(([service, status]) => (
            <div key={service} className="flex justify-between text-xs">
              <span className="capitalize">{service}:</span>
              <span className={`font-medium ${
                status === 'backend' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
