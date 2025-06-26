import { Supplier } from '../types';

class SupplierService {
  private suppliers: Supplier[] = [
    {
      id: '1',
      name: 'Công ty TNHH Thời Trang ABC',
      contactPerson: 'Nguyễn Văn A',
      email: 'contact@abc-fashion.com',
      phone: '0901234567',
      address: 'Quận 1, TP.HCM',
      paymentTerms: 'Thanh toán trong 30 ngày',
      notes: 'Nhà cung cấp chính cho dòng sản phẩm thời trang',
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Nhà máy Dệt May XYZ',
      contactPerson: 'Trần Thị B',
      email: 'sales@xyz-textile.com',
      phone: '0912345678',
      address: 'Bình Dương',
      paymentTerms: 'Thanh toán ngay khi nhận hàng',
      notes: 'Chuyên sản xuất vải và nguyên liệu may mặc',
      active: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      name: 'Công ty Nội Thất DEF',
      contactPerson: 'Lê Văn C',
      email: 'info@def-furniture.com',
      phone: '0923456789',
      address: 'Hà Nội',
      paymentTerms: 'Thanh toán 50% trước, 50% khi giao hàng',
      notes: 'Nhà cung cấp đồ nội thất và trang trí',
      active: true,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z'
    }
  ];

  async getAll(): Promise<Supplier[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.suppliers), 400);
    });
  }

  async getById(id: string): Promise<Supplier | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const supplier = this.suppliers.find(s => s.id === id) || null;
        resolve(supplier);
      }, 300);
    });
  }

  async create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSupplier: Supplier = {
          ...supplier,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.suppliers.push(newSupplier);
        resolve(newSupplier);
      }, 800);
    });
  }

  async update(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.suppliers.findIndex(s => s.id === id);
        if (index === -1) {
          reject(new Error('Supplier not found'));
          return;
        }
        this.suppliers[index] = {
          ...this.suppliers[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        resolve(this.suppliers[index]);
      }, 600);
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.suppliers.findIndex(s => s.id === id);
        if (index === -1) {
          reject(new Error('Supplier not found'));
          return;
        }
        this.suppliers.splice(index, 1);
        resolve();
      }, 400);
    });
  }
}

export const supplierService = new SupplierService();