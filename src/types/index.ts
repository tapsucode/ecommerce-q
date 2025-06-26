// Enhanced types following ADR principles

export interface ProductType {
  id: string;
  name: string;
  description: string;
  attributeDefinitions: { [key: string]: AttributeDefinition };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeDefinition {
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  variant: boolean; // Whether this attribute creates variants
  options?: string[]; // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent?: Category;
  children: Category[];
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost: number;
  currency: string;
  productType: ProductType;
  category: Category;
  attributes: { [key: string]: any }; // Dynamic attributes based on product type
  images: string[];
  variants: ProductVariant[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  attributes: { [key: string]: any }; // Variant-specific attributes
  active: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  currency: string;
  items: BundleItem[];
  calculatedStock?: number; // Calculated dynamically
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BundleItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  warehouse: string;
  location: string;
  lastUpdated: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'returned' | 'cancelled';
  channel: 'online' | 'retail' | 'wholesale';
  items: OrderItem[];
  total: number;
  discount?: number;
  appliedPromotions?: string[];
  currency: string;
  salespersonId?: string;
  salespersonName?: string;
  platformOrderId?: string;
  shippingProvider?: string;
  trackingCode?: string;
  shippingFee?: number;
  shippingAddressDetails?: string;
  confirmedAt?: string;
  shippedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  bundleId?: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  customerType: 'retail' | 'wholesale';
  totalOrders: number;
  totalSpent: number;
  currency: string;
  createdAt: string;
  lastOrderAt?: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage_discount' | 'fixed_amount_discount' | 'buy_x_get_y' | 'free_shipping' | 'bundle_discount';
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount: number;
  rules: PromotionRule[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionRule {
  id: string;
  ruleType: 'condition' | 'action';
  ruleData: { [key: string]: any };
  priority: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: Supplier;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: 'draft' | 'ordered' | 'partially_received' | 'completed' | 'cancelled';
  totalCost: number;
  notes?: string;
  createdBy: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  product?: Product;
  variant?: ProductVariant;
  productName: string;
  sku: string;
  quantity: number;
  costPrice: number;
  receivedQuantity: number;
}

export interface OrderReturn {
  id: string;
  order: Order;
  returnNumber: string;
  returnDate: string;
  reason: 'damaged' | 'wrong_item' | 'customer_change_mind' | 'quality_issue' | 'other';
  condition: 'new' | 'damaged' | 'used';
  notes?: string;
  processedBy?: string;
  items: OrderReturnItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderReturnItem {
  id: string;
  orderItem: OrderItem;
  product?: Product;
  variant?: ProductVariant;
  quantity: number;
  condition: 'new' | 'damaged' | 'used';
  restock: boolean;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockItems: number;
  currency: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  active: boolean;
  createdAt: string;
}

// Search and filter interfaces
export interface SearchFilters {
  keyword?: string;
  category?: string;
  productType?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  attributes?: { [key: string]: any };
}

export interface PaginationParams {
  page: number;
  size: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}