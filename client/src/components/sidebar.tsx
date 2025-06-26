import { ShoppingCart, BarChart3, List, Plus, Users, Settings } from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { icon: BarChart3, label: "Dashboard", active: true },
    { icon: List, label: "Danh sách đơn hàng", active: false },
    { icon: Plus, label: "Tạo đơn hàng mới", active: false },
    { icon: Users, label: "Khách hàng", active: false },
    { icon: Settings, label: "Cài đặt", active: false },
  ];

  return (
    <div className="bg-white w-64 shadow-lg flex-shrink-0 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <ShoppingCart className="text-white h-4 w-4" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">OrderFlow</h1>
        </div>
      </div>
      
      <nav className="mt-8">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="px-6 py-2">
              <a
                href="#"
                className={`flex items-center space-x-3 rounded-lg px-3 py-2 font-medium transition-colors ${
                  item.active
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
