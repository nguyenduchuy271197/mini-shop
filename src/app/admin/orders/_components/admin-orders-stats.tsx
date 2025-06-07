"use client";

import { useAdminOrders } from "@/hooks/admin/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export function AdminOrdersStats() {
  const { data, isLoading } = useAdminOrders({
    pagination: { page: 1, limit: 1 },
    includeItems: false,
    includeCustomer: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-1" />
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const summary = data?.summary;

  const stats = [
    {
      title: "Tổng đơn hàng",
      value: summary?.total_orders || 0,
      description: "Tất cả đơn hàng",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Chờ xử lý",
      value: summary?.orders_by_status?.pending || 0,
      description: "Đơn hàng chờ xử lý",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Hoàn thành",
      value: summary?.orders_by_status?.delivered || 0,
      description: "Đơn hàng đã giao",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Đã hủy",
      value: summary?.orders_by_status?.cancelled || 0,
      description: "Đơn hàng bị hủy",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Tổng doanh thu",
      value: formatCurrency(summary?.total_revenue || 0),
      description: "Tất cả đơn hàng",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Giá trị TB",
      value: formatCurrency(summary?.average_order_value || 0),
      description: "Trung bình đơn hàng",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
