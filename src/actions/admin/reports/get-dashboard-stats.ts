"use server";

import { createClient } from "@/lib/supabase/server";

type DashboardStats = {
  totalOrders: number;
  totalOrdersToday: number;
  orderGrowthPercentage: number;
  totalRevenue: number;
  revenueToday: number;
  revenueGrowthPercentage: number;
  totalProducts: number;
  productsLowStock: number;
  totalCustomers: number;
  newCustomersToday: number;
  customerGrowthPercentage: number;
  averageOrderValue: number;
  totalPayments: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topSellingProducts: Array<{
    id: number;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    customer_name?: string;
  }>;
};

type GetDashboardStatsResult =
  | { success: true; stats: DashboardStats }
  | { success: false; error: string };

export async function getDashboardStats(): Promise<GetDashboardStatsResult> {
  try {
    const supabase = createClient();

    // Kiểm tra authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Người dùng chưa được xác thực",
      };
    }

    // Kiểm tra authorization - chỉ admin mới có thể xem dashboard
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xem dashboard",
      };
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    // Lấy tổng số đơn hàng
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Lấy số đơn hàng hôm nay
    const { count: totalOrdersToday } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());

    // Lấy số đơn hàng hôm qua
    const { count: totalOrdersYesterday } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterdayStart.toISOString())
      .lt("created_at", todayStart.toISOString());

    // Tính % tăng trưởng đơn hàng
    const orderGrowthPercentage = totalOrdersYesterday && totalOrdersYesterday > 0
      ? Math.round(((totalOrdersToday || 0) - totalOrdersYesterday) / totalOrdersYesterday * 100)
      : 0;

    // Lấy tổng doanh thu
    const { data: revenueData } = await supabase
      .from("orders")
      .select("total_amount")
      .neq("status", "cancelled");

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Lấy doanh thu hôm nay
    const { data: revenueTodayData } = await supabase
      .from("orders")
      .select("total_amount")
      .neq("status", "cancelled")
      .gte("created_at", todayStart.toISOString());

    const revenueToday = revenueTodayData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Lấy doanh thu hôm qua
    const { data: revenueYesterdayData } = await supabase
      .from("orders")
      .select("total_amount")
      .neq("status", "cancelled")
      .gte("created_at", yesterdayStart.toISOString())
      .lt("created_at", todayStart.toISOString());

    const revenueYesterday = revenueYesterdayData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Tính % tăng trưởng doanh thu
    const revenueGrowthPercentage = revenueYesterday > 0
      ? Math.round((revenueToday - revenueYesterday) / revenueYesterday * 100)
      : 0;

    // Lấy tổng số sản phẩm
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Lấy số sản phẩm sắp hết hàng (stock < 10)
    const { count: productsLowStock } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lt("stock_quantity", 10);

    // Lấy tổng số khách hàng
    const { count: totalCustomers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Lấy số khách hàng mới hôm nay
    const { count: newCustomersToday } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString());

    // Lấy số khách hàng mới hôm qua
    const { count: newCustomersYesterday } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterdayStart.toISOString())
      .lt("created_at", todayStart.toISOString());

    // Tính % tăng trưởng khách hàng
    const customerGrowthPercentage = newCustomersYesterday && newCustomersYesterday > 0
      ? Math.round(((newCustomersToday || 0) - newCustomersYesterday) / newCustomersYesterday * 100)
      : 0;

    // Tính giá trị đơn hàng trung bình
    const averageOrderValue = totalOrders && totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Lấy số lượng thanh toán
    const { count: totalPayments } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true });

    // Lấy số đơn hàng theo trạng thái
    const { count: pendingOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: completedOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    const { count: cancelledOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled");

    // Lấy top sản phẩm bán chạy (30 ngày qua)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: topProductsData } = await supabase
      .from("order_items")
      .select(`
        product_id,
        quantity,
        unit_price,
        products!inner (
          id,
          name
        )
      `)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .limit(50);

    // Nhóm sản phẩm và tính tổng
    const productMap = new Map();
    topProductsData?.forEach(item => {
      const productId = item.product_id;
      if (productMap.has(productId)) {
        const existing = productMap.get(productId);
        existing.totalSold += item.quantity;
        existing.revenue += item.unit_price * item.quantity;
      } else {
        productMap.set(productId, {
          id: productId,
          name: item.products?.name || "Unknown",
          totalSold: item.quantity,
          revenue: item.unit_price * item.quantity,
        });
      }
    });

    const topSellingProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    // Lấy đơn hàng gần đây nhất
    const { data: recentOrdersData } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        user_id
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    // Lấy thông tin customer cho đơn hàng gần đây
    const recentOrders = await Promise.all(
      (recentOrdersData || []).map(async (order) => {
        let customer_name: string | undefined;

        if (order.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", order.user_id)
            .single();
          
          if (profile) {
            customer_name = profile.full_name || undefined;
          }
        }

        return {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          customer_name,
        };
      })
    );

    const stats: DashboardStats = {
      totalOrders: totalOrders || 0,
      totalOrdersToday: totalOrdersToday || 0,
      orderGrowthPercentage,
      totalRevenue,
      revenueToday,
      revenueGrowthPercentage,
      totalProducts: totalProducts || 0,
      productsLowStock: productsLowStock || 0,
      totalCustomers: totalCustomers || 0,
      newCustomersToday: newCustomersToday || 0,
      customerGrowthPercentage,
      averageOrderValue,
      totalPayments: totalPayments || 0,
      pendingOrders: pendingOrders || 0,
      completedOrders: completedOrders || 0,
      cancelledOrders: cancelledOrders || 0,
      topSellingProducts,
      recentOrders,
    };

    return {
      success: true,
      stats,
    };
  } catch {
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi lấy thống kê dashboard",
    };
  }
} 