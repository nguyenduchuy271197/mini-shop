import { createClient } from "@/lib/supabase/server";
import { Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";

export async function AdminInventoryStats() {
  const supabase = createClient();

  // Get inventory statistics
  const [
    { data: totalProducts },
    { data: lowStockProducts },
    { data: outOfStockProducts },
    { data: inventoryValue },
  ] = await Promise.all([
    supabase.from("products").select("stock_quantity").eq("is_active", true),
    supabase
      .from("products")
      .select("stock_quantity")
      .eq("is_active", true)
      .lt("stock_quantity", 10)
      .gt("stock_quantity", 0),
    supabase
      .from("products")
      .select("stock_quantity")
      .eq("is_active", true)
      .eq("stock_quantity", 0),
    supabase
      .from("products")
      .select("stock_quantity, price")
      .eq("is_active", true),
  ]);

  // Calculate total stock
  const totalStock =
    totalProducts?.reduce(
      (sum, product) => sum + (product.stock_quantity || 0),
      0
    ) || 0;

  // Calculate inventory value
  const totalValue =
    inventoryValue?.reduce((sum, product) => {
      return sum + (product.stock_quantity || 0) * (product.price || 0);
    }, 0) || 0;

  const stats = [
    {
      title: "Tổng tồn kho",
      value: totalStock.toLocaleString(),
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Sắp hết hàng",
      value: lowStockProducts?.length || 0,
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
    {
      title: "Hết hàng",
      value: outOfStockProducts?.length || 0,
      icon: TrendingDown,
      color: "bg-red-500",
    },
    {
      title: "Giá trị kho",
      value: `${(totalValue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "bg-green-500",
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
