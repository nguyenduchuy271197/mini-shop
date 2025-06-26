import { createClient } from "@/lib/supabase/server";
import { AdminPageWrapper } from "@/components/admin/admin-page-wrapper";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminDashboardStats } from "./_components/admin-dashboard-stats";
import { AdminRecentOrders } from "./_components/admin-recent-orders";
import { AdminTopProducts } from "./_components/admin-top-products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản trị hệ thống",
  description:
    "Bảng điều khiển quản trị Minishop. Quản lý sản phẩm, đơn hàng, khách hàng và thống kê bán hàng.",
  keywords: "admin, quản trị, bảng điều khiển, thống kê",
  openGraph: {
    title: "Quản trị hệ thống | Minishop",
    description: "Bảng điều khiển quản trị Minishop",
    url: "/admin",
    images: [
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Admin Dashboard Minishop",
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

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
    <AdminPageWrapper>
      <AdminPageHeader
        title="Dashboard"
        description="Tổng quan về hoạt động kinh doanh của Mini Shop"
      />

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
    </AdminPageWrapper>
  );
}
