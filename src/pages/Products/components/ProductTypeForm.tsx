import React, { useState } from 'react';
import { ProductType, AttributeDefinition } from '../../../types';
import Button from '../../../components/UI/Button';
import { Plus, Trash2 } from 'lucide-react';

interface ProductTypeFormProps {
  productType?: ProductType | null;
  onSubmit: (productType: Omit<ProductType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const ProductTypeForm: React.FC<ProductTypeFormProps> = ({ productType, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: productType?.name || '',
    description: productType?.description || '',
    attributeDefinitions: productType?.attributeDefinitions || {},
    active: productType?.active ?? true
  });

  const [newAttribute, setNewAttribute] = useState({
    name: '',
    type: 'string' as 'string' | 'number' | 'boolean' | 'select',
    required: false,
    variant: false,
    options: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addAttribute = () => {
    if (!newAttribute.name) return;

    const attributeDef: AttributeDefinition = {
      type: newAttribute.type,
      required: newAttribute.required,
      variant: newAttribute.variant,
      ...(newAttribute.type === 'select' && { options: newAttribute.options })
    };

    setFormData({
      ...formData,
      attributeDefinitions: {
        ...formData.attributeDefinitions,
        [newAttribute.name]: attributeDef
      }
    });

    setNewAttribute({
      name: '',
      type: 'string',
      required: false,
      variant: false,
      options: []
    });
  };

  const removeAttribute = (attributeName: string) => {
    const { [attributeName]: removed, ...rest } = formData.attributeDefinitions;
    setFormData({
      ...formData,
      attributeDefinitions: rest
    });
  };

  const addOption = () => {
    setNewAttribute({
      ...newAttribute,
      options: [...newAttribute.options, '']
    });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newAttribute.options];
    updatedOptions[index] = value;
    setNewAttribute({
      ...newAttribute,
      options: updatedOptions
    });
  };

  const removeOption = (index: number) => {
    setNewAttribute({
      ...newAttribute,
      options: newAttribute.options.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Type Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Clothing, Electronics, Books"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what this product type represents"
          />
        </div>
      </div>

      {/* Existing Attributes */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Defined Attributes</h3>
        {Object.entries(formData.attributeDefinitions).length === 0 ? (
          <p className="text-gray-500 text-sm">No attributes defined yet</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(formData.attributeDefinitions).map(([name, def]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{name}</span>
                  <div className="text-sm text-gray-600">
                    Type: {def.type} | 
                    {def.required && ' Required'} |
                    {def.variant && ' Creates Variants'}
                    {def.options && ` | Options: ${def.options.join(', ')}`}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => removeAttribute(name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Attribute */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Attribute</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attribute Name
            </label>
            <input
              type="text"
              value={newAttribute.name}
              onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., size, color, material"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={newAttribute.type}
              onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="string">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Yes/No</option>
              <option value="select">Select Options</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newAttribute.required}
                onChange={(e) => setNewAttribute({ ...newAttribute, required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Required</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newAttribute.variant}
                onChange={(e) => setNewAttribute({ ...newAttribute, variant: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Creates Variants</span>
            </label>
          </div>
        </div>

        {newAttribute.type === 'select' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {newAttribute.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Option value"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={addOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <Button
            type="button"
            onClick={addAttribute}
            disabled={!newAttribute.name}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Attribute
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {productType ? 'Update Product Type' : 'Create Product Type'}
        </Button>
      </div>
    </form>
  );
};

export default ProductTypeForm;