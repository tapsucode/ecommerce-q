import { Product, InventoryItem, Order, Customer } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    sku: 'TSH-001',
    category: 'Fashion',
    description: 'High-quality cotton t-shirt available in multiple colors',
    price: 29.99,
    cost: 15.00,
    currency: 'USD',
    images: ['https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg'],
    variants: [
      { id: '1a', name: 'Small - Black', sku: 'TSH-001-S-BLK', price: 29.99, cost: 15.00, stock: 25, attributes: { size: 'S', color: 'Black' } },
      { id: '1b', name: 'Medium - Black', sku: 'TSH-001-M-BLK', price: 29.99, cost: 15.00, stock: 30, attributes: { size: 'M', color: 'Black' } },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Ceramic Vase Set',
    sku: 'VAS-001',
    category: 'Home Decoration',
    description: 'Beautiful ceramic vase set for home decoration',
    price: 89.99,
    cost: 45.00,
    currency: 'USD',
    images: ['https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg'],
    variants: [
      { id: '2a', name: 'White', sku: 'VAS-001-WHT', price: 89.99, cost: 45.00, stock: 15, attributes: { color: 'White' } },
      { id: '2b', name: 'Blue', sku: 'VAS-001-BLU', price: 89.99, cost: 45.00, stock: 12, attributes: { color: 'Blue' } },
    ],
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  }
];

export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Premium Cotton T-Shirt',
    sku: 'TSH-001',
    currentStock: 55,
    reservedStock: 5,
    availableStock: 50,
    reorderLevel: 20,
    warehouse: 'Main Warehouse',
    location: 'A1-B2',
    lastUpdated: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    productId: '2',
    productName: 'Ceramic Vase Set',
    sku: 'VAS-001',
    currentStock: 27,
    reservedStock: 2,
    availableStock: 25,
    reorderLevel: 10,
    warehouse: 'Main Warehouse',
    location: 'B2-C3',
    lastUpdated: '2024-01-20T14:30:00Z',
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerId: '1',
    customerName: 'John Smith',
    status: 'processing',
    channel: 'online',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Premium Cotton T-Shirt',
        sku: 'TSH-001-M-BLK',
        quantity: 2,
        price: 29.99,
        total: 59.98,
      }
    ],
    total: 59.98,
    currency: 'USD',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerId: '2',
    customerName: 'Sarah Johnson',
    status: 'shipped',
    channel: 'retail',
    items: [
      {
        id: '2',
        productId: '2',
        productName: 'Ceramic Vase Set',
        sku: 'VAS-001-WHT',
        quantity: 1,
        price: 89.99,
        total: 89.99,
      }
    ],
    total: 89.99,
    currency: 'USD',
    createdAt: '2024-01-19T15:30:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    address: '123 Main St, New York, NY 10001',
    country: 'United States',
    customerType: 'retail',
    totalOrders: 3,
    totalSpent: 179.97,
    currency: 'USD',
    createdAt: '2024-01-10T10:00:00Z',
    lastOrderAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0456',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    country: 'United States',
    customerType: 'wholesale',
    totalOrders: 5,
    totalSpent: 899.95,
    currency: 'USD',
    createdAt: '2024-01-12T14:00:00Z',
    lastOrderAt: '2024-01-19T15:30:00Z',
  }
];