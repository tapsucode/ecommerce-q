import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Store,
  Percent,
  Truck,
  FileText,
  Plus
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user, canPerformAction } = useAuth();

  const allNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, action: null },
    { name: 'Sản phẩm', href: '/products', icon: Package, action: 'manage_inventory' },
    { name: 'Kho hàng', href: '/inventory', icon: Warehouse, action: 'manage_inventory' },
    { name: 'Đơn hàng', href: '/orders', icon: ShoppingCart, action: null },
    { name: 'Khách hàng', href: '/customers', icon: Users, action: 'search_customers' },
    { name: 'Khuyến mãi', href: '/promotions', icon: Percent, action: 'manage_promotions' },
    { name: 'Nhà cung cấp', href: '/suppliers', icon: Truck, action: 'manage_inventory' },
    { name: 'Đơn mua hàng', href: '/purchase-orders', icon: FileText, action: 'manage_inventory' },
    { name: 'Báo cáo', href: '/reports', icon: BarChart3, action: 'view_reports' },
  ];

  // Filter navigation based on user permissions
  const navigation = allNavigation.filter(item => 
    !item.action || canPerformAction(item.action)
  );

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Store className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">{t('sidebar.inventoryPro')}</span>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;