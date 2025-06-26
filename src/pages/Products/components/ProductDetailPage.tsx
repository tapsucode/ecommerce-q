import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Product, ProductVariant } from '../../../types';
import Button from '../../../components/UI/Button';
import { ShoppingCart, Heart, Share2, Star } from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (variantId: string, quantity: number) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onAddToCart }) => {
  const { t } = useTranslation();
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [availableOptions, setAvailableOptions] = useState<{ [key: string]: string[] }>({});
  const [variantStates, setVariantStates] = useState<any>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // ADR 02: Load available options and variant states
  useEffect(() => {
    loadProductData();
  }, [product.id]);

  // ADR 02: Find variant when attributes change
  useEffect(() => {
    if (Object.keys(selectedAttributes).length > 0) {
      findVariantByAttributes();
    }
  }, [selectedAttributes]);

  /**
   * ADR 02: Hành động 3 & 4 - Load available options and variant states
   */
  const loadProductData = async () => {
    setLoading(true);
    try {
      // Get available options
      const optionsResponse = await fetch(`/api/product-variants/product/${product.id}/options`);
      if (optionsResponse.ok) {
        const options = await optionsResponse.json();
        setAvailableOptions(options);
      }

      // Get variant states
      const statesResponse = await fetch(`/api/product-variants/product/${product.id}/states`);
      if (statesResponse.ok) {
        const states = await statesResponse.json();
        setVariantStates(states);
      }
    } catch (error) {
      console.error('Failed to load product data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ADR 02: Hành động 5 - Find variant by selected attributes
   */
  const findVariantByAttributes = async () => {
    try {
      const response = await fetch(`/api/product-variants/product/${product.id}/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedAttributes)
      });

      if (response.ok) {
        const variant = await response.json();
        setSelectedVariant(variant);
      } else {
        setSelectedVariant(null);
      }
    } catch (error) {
      console.error('Failed to find variant:', error);
      setSelectedVariant(null);
    }
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      onAddToCart(selectedVariant.id, quantity);
    }
  };

  const isOptionAvailable = (attributeName: string, value: string) => {
    const variantKey = generateVariantKey({ ...selectedAttributes, [attributeName]: value });
    return variantStates.availability?.[variantKey] === 'available';
  };

  const generateVariantKey = (attributes: { [key: string]: string }) => {
    return Object.entries(attributes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product.price;
  };

  const getCurrentStock = () => {
    if (selectedVariant) {
      const variantKey = generateVariantKey(selectedAttributes);
      return variantStates.stock?.[variantKey] || 0;
    }
    return 0;
  };

  const isInStock = () => {
    return getCurrentStock() > 0;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.images[0] || 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover object-center cursor-pointer hover:opacity-75"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8) • 124 {t('products.reviews')}</span>
            </div>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-gray-900">
            ${getCurrentPrice().toFixed(2)} {product.currency}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('common.description')}</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Product Options */}
          {Object.keys(availableOptions).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">{t('products.selectOptions')}</h3>
              
              {Object.entries(availableOptions).map(([attributeName, values]) => (
                <div key={attributeName}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {values.map((value) => {
                      const isSelected = selectedAttributes[attributeName] === value;
                      const isAvailable = isOptionAvailable(attributeName, value);
                      
                      return (
                        <button
                          key={value}
                          onClick={() => handleAttributeChange(attributeName, value)}
                          disabled={!isAvailable}
                          className={`
                            px-3 py-2 text-sm font-medium rounded-lg border transition-colors
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : isAvailable
                                ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }
                          `}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isInStock() ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${isInStock() ? 'text-green-700' : 'text-red-700'}`}>
              {isInStock() 
                ? `${getCurrentStock()} ${t('inventory.inStock')}`
                : t('inventory.outOfStock')
              }
            </span>
          </div>

          {/* Quantity and Add to Cart */}
          {isInStock() && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.quantity')}
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(getCurrentStock(), quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || !isInStock()}
                  className="flex-1"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t('products.addToCart')}
                </Button>
                
                <Button variant="secondary" className="px-4">
                  <Heart className="h-5 w-5" />
                </Button>
                
                <Button variant="secondary" className="px-4">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Product Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">{t('products.specifications')}</h3>
              <dl className="grid grid-cols-1 gap-2">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-600">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </dt>
                    <dd className="text-sm text-gray-900">{value.toString()}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;