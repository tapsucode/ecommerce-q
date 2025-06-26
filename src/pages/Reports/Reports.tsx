import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/UI/Card';
import { TrendingUp, DollarSign, Package, Users } from 'lucide-react';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('30days');

  // Mock data for charts
  const salesData = [
    { month: 'Jan', sales: 12000, orders: 45, customers: 25 },
    { month: 'Feb', sales: 15000, orders: 52, customers: 30 },
    { month: 'Mar', sales: 18000, orders: 61, customers: 35 },
    { month: 'Apr', sales: 22000, orders: 75, customers: 42 },
    { month: 'May', sales: 25000, orders: 83, customers: 48 },
    { month: 'Jun', sales: 28000, orders: 91, customers: 55 },
  ];

  const categoryData = [
    { name: t('categories.fashion'), value: 45, color: '#3B82F6' },
    { name: t('categories.homeDecoration'), value: 35, color: '#059669' },
    { name: t('categories.electronics'), value: 15, color: '#F59E0B' },
    { name: t('categories.books'), value: 5, color: '#EF4444' },
  ];

  const channelData = [
    { name: t('orders.online'), value: 60, color: '#8B5CF6' },
    { name: t('orders.retail'), value: 30, color: '#06B6D4' },
    { name: t('orders.wholesale'), value: 10, color: '#F97316' },
  ];

  const topProducts = [
    { name: 'Premium Cotton T-Shirt', sales: 1250, revenue: 37500 },
    { name: 'Ceramic Vase Set', sales: 450, revenue: 40500 },
    { name: 'Designer Lamp', sales: 320, revenue: 25600 },
    { name: 'Silk Scarf', sales: 280, revenue: 16800 },
    { name: 'Coffee Table', sales: 180, revenue: 36000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-gray-600 mt-2">{t('reports.subtitle')}</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">{t('reports.last7Days')}</option>
          <option value="30days">{t('reports.last30Days')}</option>
          <option value="90days">{t('reports.last90Days')}</option>
          <option value="12months">{t('reports.last12Months')}</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">$120,000</h3>
              <p className="text-sm text-gray-600">{t('reports.totalRevenue')}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% {t('reports.fromLastPeriod')}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">407</h3>
              <p className="text-sm text-gray-600">{t('reports.totalOrders')}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.3% {t('reports.fromLastPeriod')}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">235</h3>
              <p className="text-sm text-gray-600">{t('reports.newCustomers')}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.2% {t('reports.fromLastPeriod')}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">$295</h3>
              <p className="text-sm text-gray-600">{t('reports.avgOrderValue')}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3.8% {t('reports.fromLastPeriod')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Trend */}
      <Card title={t('reports.salesTrend')} className="col-span-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value, name) => [
              name === 'sales' ? `$${value.toLocaleString()}` : value,
              name === 'sales' ? t('reports.revenue') : name === 'orders' ? t('orders.orders') : t('reports.newCustomers')
            ]} />
            <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} name="sales" />
            <Line type="monotone" dataKey="orders" stroke="#059669" strokeWidth={2} name="orders" />
            <Line type="monotone" dataKey="customers" stroke="#F59E0B" strokeWidth={2} name="customers" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card title={t('reports.salesByCategory')}>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Channel Performance */}
        <Card title={t('reports.salesByChannel')}>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card title={t('reports.topPerformingProducts')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('products.productName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports.unitsSold')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports.revenue')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reports.performance')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(product.sales / 1250) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;