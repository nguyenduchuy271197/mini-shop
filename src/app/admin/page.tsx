import { createClient } from "@/lib/supabase/server";
import { AdminDashboardStats } from "./_components/admin-dashboard-stats";
import { AdminRecentOrders } from "./_components/admin-recent-orders";
import { AdminTopProducts } from "./_components/admin-top-products";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Get dashboard statistics
  const [
    { count: totalOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select(
        `
        *,
        order_items(
          *,
          products(name)
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Calculate total revenue
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("payment_status", "paid");

  const totalRevenue =
    revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
    0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Tổng quan về hoạt động kinh doanh của Mini Shop
        </p>
      </div>

      {/* Statistics Cards */}
      <AdminDashboardStats
        totalOrders={totalOrders || 0}
        totalCustomers={totalCustomers || 0}
        totalProducts={totalProducts || 0}
        totalRevenue={totalRevenue}
      />

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <AdminRecentOrders orders={recentOrders || []} />

        {/* Top Products */}
        <AdminTopProducts />
      </div>
    </div>
  );
}
