import { createClient } from "@/lib/supabase/server";
import { Package, Eye, Star, AlertTriangle } from "lucide-react";

export async function AdminProductsStats() {
  const supabase = createClient();

  // Get products statistics
  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: featuredProducts },
    { count: lowStockProducts },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_featured", true),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lt("stock_quantity", 10), // Low stock threshold
  ]);

  const stats = [
    {
      title: "Tổng sản phẩm",
      value: totalProducts || 0,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Đang bán",
      value: activeProducts || 0,
      icon: Eye,
      color: "bg-green-500",
    },
    {
      title: "Sản phẩm nổi bật",
      value: featuredProducts || 0,
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      title: "Sắp hết hàng",
      value: lowStockProducts || 0,
      icon: AlertTriangle,
      color: "bg-red-500",
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
          </div>
        );
      })}
    </div>
  );
}
