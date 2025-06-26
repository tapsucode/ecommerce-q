import React, { useState, useEffect } from 'react';
import Button from '../../../components/UI/Button';

interface EnhancedCreateOrderFormProps {
  onCancel: () => void;
}

const EnhancedCreateOrderForm: React.FC<EnhancedCreateOrderFormProps> = ({ onSubmit, onCancel }) => {
      

      address: '',


    } else {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        price: product.price,
        total: product.price
      };
    }
  };


  };

  };

  const calculateSubtotal = () => {
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    }
    }

  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

    e.preventDefault();
    
      return;
    }

      subtotal: calculateSubtotal(),
      total: calculateTotal(),
    };

    onSubmit(orderData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
            <input
              type="text"
            />
            >
          </div>
            </div>
              >
            </div>
        </div>
      </div>

      <div>
        
              <div 
                key={product.id}
              >
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
              </div>
          </div>
        </div>

                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                      />
                      <Button
                        type="button"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                ))}
          </div>
      </div>

      {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
            </div>
              <div className="flex justify-between text-green-600">
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

        <Button type="button" variant="secondary" onClick={onCancel}>
        </Button>
        </Button>
      </div>
    </form>
  );
};

export default EnhancedCreateOrderForm;