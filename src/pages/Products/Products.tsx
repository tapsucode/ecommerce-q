import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../../hooks/useProducts';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import ProductForm from './components/ProductForm';
import { Product } from '../../types';

const Products: React.FC = () => {
  const { t } = useTranslation();
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createProduct(productData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleUpdateProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm(t('products.deleteConfirm'))) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const columns = [
    {
      key: 'image',
      title: t('products.image'),
      width: '80px',
      render: (value: string[], record: Product) => (
        <img
          src={record.images[0] || 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg'}
          alt={record.name}
          className="h-12 w-12 object-cover rounded-lg"
        />
      ),
    },
    {
      key: 'name',
      title: t('products.productName'),
      render: (value: string, record: Product) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">SKU: {record.sku}</p>
        </div>
      ),
    },
    { key: 'category', title: t('products.category') },
    {
      key: 'price',
      title: t('common.price'),
      render: (value: number, record: Product) => `$${value.toFixed(2)} ${record.currency}`,
    },
    {
      key: 'variants',
      title: t('products.variants'),
      render: (value: any[]) => `${value.length} ${t('products.variant')}(s)`,
    },
    {
      key: 'actions',
      title: t('common.actions'),
      render: (value: any, record: Product) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditingProduct(record);
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteProduct(record.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('products.title')}</h1>
          <p className="text-gray-600 mt-2">{t('products.subtitle')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('products.addProduct')}
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('products.searchProducts')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <Table columns={columns} data={filteredProducts} loading={loading} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? t('products.editProduct') : t('products.addNewProduct')}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Products;