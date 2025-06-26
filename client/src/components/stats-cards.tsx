import { ShoppingBag, Clock, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    monthlyRevenue: number;
  };
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statsData = [
    {
      title: "Tổng đơn hàng",
      value: stats?.totalOrders || 0,
      change: "12% so với tháng trước",
      icon: ShoppingBag,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-green-600",
      changeIcon: TrendingUp,
    },
    {
      title: "Đơn chờ xử lý",
      value: stats?.pendingOrders || 0,
      change: "Cần xử lý ngay",
      icon: Clock,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      changeColor: "text-amber-600",
      changeIcon: Clock,
    },
    {
      title: "Đã hoàn thành",
      value: stats?.completedOrders || 0,
      change: `${stats?.totalOrders ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}% tỷ lệ hoàn thành`,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600",
      changeIcon: CheckCircle,
    },
    {
      title: "Doanh thu tháng",
      value: formatCurrency(stats?.monthlyRevenue || 0),
      change: "8.2% tăng trưởng",
      icon: DollarSign,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      changeColor: "text-green-600",
      changeIcon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const ChangeIcon = stat.changeIcon;
        
        return (
          <Card key={index} className="border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs ${stat.changeColor} flex items-center mt-1`}>
                    <ChangeIcon className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
