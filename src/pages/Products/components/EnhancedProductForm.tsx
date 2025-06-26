import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Product, ProductType, Category, AttributeDefinition } from '../../../types';
import Button from '../../../components/UI/Button';
import { Plus, Trash2, Wand2 } from 'lucide-react';

interface EnhancedProductFormProps {
  product?: Product | null;
  productTypes: ProductType[];
  categories: Category[];
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({ 
  product, 
  productTypes, 
  categories, 
  onSubmit, 
  onCancel 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    price: product?.price || 0,
    cost: product?.cost || 0,
    currency: product?.currency || 'USD',
    productTypeId: product?.productType?.id || '',
    categoryId: product?.category?.id || '',
    attributes: product?.attributes || {},
    images: product?.images || [''],
    variants: product?.variants || []
  });

  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);

  useEffect(() => {
    if (formData.productTypeId) {
      const productType = productTypes.find(pt => pt.id === formData.productTypeId);
      setSelectedProductType(productType || null);
    }
  }, [formData.productTypeId, productTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedType = productTypes.find(pt => pt.id === formData.productTypeId);
    const selectedCategory = categories.find(c => c.id === formData.categoryId);
    
    if (!selectedType || !selectedCategory) return;

    const productData = {
      ...formData,
      productType: selectedType,
      category: selectedCategory,
      active: true
    };

    onSubmit(productData);
  };

  const handleAttributeChange = (attributeName: string, value: any) => {
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        [attributeName]: value
      }
    });
  };

  const generateVariants = async () => {
    if (!selectedProductType) return;

    setIsGeneratingVariants(true);
    
    try {
      // Call backend API to generate variants
      const response = await fetch('/api/product-variants/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTypeId: selectedProductType.id,
          baseAttributes: formData.attributes,
          basePrice: formData.price,
          baseCost: formData.cost,
          baseSku: formData.sku
        })
      });

      if (response.ok) {
        const generatedVariants = await response.json();
        setFormData({ ...formData, variants: generatedVariants });
      }
    } catch (error) {
      console.error('Failed to generate variants:', error);
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const renderAttributeInput = (attributeName: string, definition: AttributeDefinition) => {
    const value = formData.attributes[attributeName] || '';

    switch (definition.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAttributeChange(attributeName, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={definition.required}
            placeholder={t('products.enterValue')}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleAttributeChange(attributeName, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={definition.required}
            placeholder={t('products.enterNumber')}
          />
        );
      
      case 'boolean':
        return (
          <select
            value={value.toString()}
            onChange={(e) => handleAttributeChange(attributeName, e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={definition.required}
          >
            <option value="">{t('common.select')}</option>
            <option value="true">{t('common.yes')}</option>
            <option value="false">{t('common.no')}</option>
          </select>
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleAttributeChange(attributeName, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={definition.required}
          >
            <option value="">{t('common.select')}</option>
            {definition.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  const currencies = [
    { value: 'USD', label: t('currencies.usd') },
    { value: 'EUR', label: t('currencies.eur') },
    { value: 'GBP', label: t('currencies.gbp') },
    { value: 'JPY', label: t('currencies.jpy') },
    { value: 'VND', label: t('currencies.vnd') }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('products.productName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('products.enterProductName')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('products.sku')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('products.enterSku')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('products.productType')} <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.productTypeId}
            onChange={(e) => setFormData({ ...formData, productTypeId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('products.selectProductType')}</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('products.category')} <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('products.selectCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('common.price')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('common.cost')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
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
            {currencies.map((currency) => (
              <option key={currency.value} value={currency.value}>{currency.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('common.description')}
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('products.enterDescription')}
        />
      </div>

      {/* Dynamic Attributes based on Product Type */}
      {selectedProductType && Object.keys(selectedProductType.attributeDefinitions).length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('products.attributes')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(selectedProductType.attributeDefinitions).map(([attributeName, definition]) => (
              <div key={attributeName}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {attributeName.charAt(0).toUpperCase() + attributeName.slice(1)}
                  {definition.required && <span className="text-red-500 ml-1">*</span>}
                  {definition.variant && <span className="text-blue-500 ml-1">({t('products.createsVariants')})</span>}
                </label>
                {renderAttributeInput(attributeName, definition)}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={generateVariants}
              disabled={isGeneratingVariants}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {isGeneratingVariants ? t('products.generating') : t('products.generateVariants')}
            </Button>
          </div>
        </div>
      )}

      {/* Generated Variants Preview */}
      {formData.variants.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('products.generatedVariants')} ({formData.variants.length})
          </h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {formData.variants.map((variant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{variant.name}</span>
                  <span className="text-sm text-gray-500 ml-2">SKU: {variant.sku}</span>
                </div>
                <div className="text-sm text-gray-600">
                  ${variant.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('products.imageUrl')}
        </label>
        <input
          type="url"
          value={formData.images[0]}
          onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">
          {product ? t('products.updateProduct') : t('products.createProduct')}
        </Button>
      </div>
    </form>
  );
};

export default EnhancedProductForm;