import { ShoppingBag, Users, ClipboardList, DollarSign } from "lucide-react";

interface AdminDashboardStatsProps {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
}

export function AdminDashboardStats({
  totalOrders,
  totalCustomers,
  totalProducts,
  totalRevenue,
}: AdminDashboardStatsProps) {
  const stats = [
    {
      title: "Tổng đơn hàng",
      value: totalOrders.toLocaleString(),
      icon: ClipboardList,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "increase" as const,
    },
    {
      title: "Khách hàng",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: "bg-green-500",
      change: "+8%",
      changeType: "increase" as const,
    },
    {
      title: "Sản phẩm",
      value: totalProducts.toLocaleString(),
      icon: ShoppingBag,
      color: "bg-purple-500",
      change: "+3%",
      changeType: "increase" as const,
    },
    {
      title: "Doanh thu",
      value: `${totalRevenue.toLocaleString()} ₫`,
      icon: DollarSign,
      color: "bg-orange-500",
      change: "+15%",
      changeType: "increase" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                so với tháng trước
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
