"use client";

import { useAdminProducts } from "@/hooks/admin/products";
import { Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";

export function AdminInventoryStatsWrapper() {
  // Get all products to calculate stats
  const { data: productsData, isLoading } = useAdminProducts({
    page: 1,
    limit: 1000, // Get all products for stats
    isActive: true,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const products = productsData?.products || [];

  // Calculate statistics
  const totalStock = products.reduce(
    (sum, product) => sum + (product.stock_quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      (product.stock_quantity || 0) > 0 &&
      (product.stock_quantity || 0) <= (product.low_stock_threshold || 10)
  );

  const outOfStockProducts = products.filter(
    (product) => (product.stock_quantity || 0) === 0
  );

  const totalValue = products.reduce((sum, product) => {
    return sum + (product.stock_quantity || 0) * (product.price || 0);
  }, 0);

  const stats = [
    {
      title: "Tổng tồn kho",
      value: totalStock.toLocaleString("vi-VN"),
      icon: Package,
      color: "bg-blue-500",
      description: `${products.length} sản phẩm`,
    },
    {
      title: "Sắp hết hàng",
      value: lowStockProducts.length.toLocaleString("vi-VN"),
      icon: AlertTriangle,
      color: "bg-orange-500",
      description: "Cần nhập thêm",
    },
    {
      title: "Hết hàng",
      value: outOfStockProducts.length.toLocaleString("vi-VN"),
      icon: TrendingDown,
      color: "bg-red-500",
      description: "Cần nhập ngay",
    },
    {
      title: "Giá trị kho",
      value:
        totalValue >= 1000000
          ? `${(totalValue / 1000000).toFixed(1)}M`
          : `${(totalValue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "bg-green-500",
      description: "VNĐ",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
