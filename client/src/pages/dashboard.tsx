import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import OrdersTable from "@/components/orders-table";
import OrderModal from "@/components/order-modal";
import { Button } from "@/components/ui/button";
import { Plus, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { OrderWithItems } from "@shared/schema";

export default function Dashboard() {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders", searchQuery, statusFilter],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleModalClose = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
    refetchOrders();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header with Sidebar */}
      <div className="lg:hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <h1 className="text-lg font-semibold">OrderFlow</h1>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-600 mt-1">Tổng quan quản lý đơn hàng</p>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} isLoading={statsLoading} />

            {/* Order Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Orders Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quản lý đơn hàng</h3>
                    <p className="text-sm text-gray-600 mt-1">Xem và quản lý tất cả đơn hàng</p>
                  </div>
                  
                  <Button onClick={handleCreateOrder} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo đơn mới
                  </Button>
                </div>
              </div>

              {/* Orders Table */}
              <OrdersTable
                orders={orders}
                isLoading={ordersLoading}
                onEditOrder={handleEditOrder}
                onRefetch={refetchOrders}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={handleModalClose}
        order={selectedOrder}
      />
    </div>
  );
}
