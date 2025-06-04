"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Date range type
type DateRange = {
  startDate: string;
  endDate: string;
};

// Schema validation
const revenueAnalyticsSchema = z.object({
  startDate: z.string().datetime("Ngày bắt đầu không hợp lệ"),
  endDate: z.string().datetime("Ngày kết thúc không hợp lệ"),
}).refine((data) => {
  return new Date(data.endDate) > new Date(data.startDate);
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"]
});

type RevenueAnalytics = {
  totalRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  totalDiscounts: number;
  totalTax: number;
  totalShipping: number;
  totalRefunds: number;
  averageOrderValue: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  revenueByCategory: Array<{
    categoryName: string;
    revenue: number;
    percentage: number;
  }>;
  revenueByPaymentMethod: Array<{
    paymentMethod: string;
    revenue: number;
    percentage: number;
  }>;
  monthlyComparison: {
    currentPeriod: number;
    previousPeriod: number;
    growthPercentage: number;
  };
};

type GetRevenueAnalyticsResult =
  | { success: true; analytics: RevenueAnalytics }
  | { success: false; error: string };

export async function getRevenueAnalytics(
  dateRange: DateRange
): Promise<GetRevenueAnalyticsResult> {
  try {
    // Validate input
    const validatedData = revenueAnalyticsSchema.parse(dateRange);

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

    // Kiểm tra authorization - chỉ admin mới có thể xem báo cáo
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể xem phân tích doanh thu",
      };
    }

    // Lấy dữ liệu đơn hàng trong khoảng thời gian
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        status,
        created_at
      `)
      .gte("created_at", validatedData.startDate)
      .lte("created_at", validatedData.endDate)
      .neq("status", "cancelled");

    if (ordersError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu đơn hàng",
      };
    }

    // Lấy dữ liệu thanh toán
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select(`
        payment_method,
        amount,
        status,
        orders!inner (
          created_at
        )
      `)
      .gte("orders.created_at", validatedData.startDate)
      .lte("orders.created_at", validatedData.endDate)
      .eq("status", "completed");

    if (paymentsError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu thanh toán",
      };
    }

    // Lấy dữ liệu order items với category
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from("order_items")
      .select(`
        total_price,
        products!inner (
          categories (
            name
          )
        ),
        orders!inner (
          created_at,
          status
        )
      `)
      .gte("orders.created_at", validatedData.startDate)
      .lte("orders.created_at", validatedData.endDate)
      .neq("orders.status", "cancelled");

    if (orderItemsError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu order items",
      };
    }

    // Tính toán các metrics
    const totalOrders = ordersData?.length || 0;
    const grossRevenue = ordersData?.reduce((sum, order) => sum + order.subtotal, 0) || 0;
    const totalDiscounts = ordersData?.reduce((sum, order) => sum + (order.discount_amount || 0), 0) || 0;
    const totalTax = ordersData?.reduce((sum, order) => sum + (order.tax_amount || 0), 0) || 0;
    const totalShipping = ordersData?.reduce((sum, order) => sum + (order.shipping_amount || 0), 0) || 0;
    const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const netRevenue = totalRevenue - totalTax - totalShipping;

    // Tính total refunds (đơn hàng bị refund)
    const { data: refundedOrders } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", validatedData.startDate)
      .lte("created_at", validatedData.endDate)
      .eq("status", "refunded");

    const totalRefunds = refundedOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Daily revenue
    const dailyRevenueMap = new Map<string, { revenue: number; orders: number }>();
    
    ordersData?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      
      if (!dailyRevenueMap.has(date)) {
        dailyRevenueMap.set(date, { revenue: 0, orders: 0 });
      }
      
      const dayData = dailyRevenueMap.get(date)!;
      dayData.revenue += order.total_amount;
      dayData.orders += 1;
    });

    const dailyRevenue = Array.from(dailyRevenueMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Revenue by category
    const categoryRevenueMap = new Map<string, number>();
    
    orderItemsData?.forEach(item => {
      const categoryName = item.products?.categories?.name || "Uncategorized";
      const current = categoryRevenueMap.get(categoryName) || 0;
      categoryRevenueMap.set(categoryName, current + item.total_price);
    });

    const revenueByCategory = Array.from(categoryRevenueMap.entries())
      .map(([categoryName, revenue]) => ({
        categoryName,
        revenue,
        percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Revenue by payment method
    const paymentMethodRevenueMap = new Map<string, number>();
    
    paymentsData?.forEach(payment => {
      const method = payment.payment_method;
      const current = paymentMethodRevenueMap.get(method) || 0;
      paymentMethodRevenueMap.set(method, current + payment.amount);
    });

    const revenueByPaymentMethod = Array.from(paymentMethodRevenueMap.entries())
      .map(([paymentMethod, revenue]) => ({
        paymentMethod,
        revenue,
        percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Monthly comparison (so với period trước đó cùng độ dài)
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    
    const previousPeriodEnd = new Date(startDate.getTime() - 1);
    const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodLength);

    const { data: previousPeriodOrders } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", previousPeriodStart.toISOString())
      .lte("created_at", previousPeriodEnd.toISOString())
      .neq("status", "cancelled");

    const previousPeriodRevenue = previousPeriodOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    
    const growthPercentage = previousPeriodRevenue > 0 
      ? Math.round(((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
      : 0;

    const analytics: RevenueAnalytics = {
      totalRevenue,
      grossRevenue,
      netRevenue,
      totalDiscounts,
      totalTax,
      totalShipping,
      totalRefunds,
      averageOrderValue,
      dailyRevenue,
      revenueByCategory,
      revenueByPaymentMethod,
      monthlyComparison: {
        currentPeriod: totalRevenue,
        previousPeriod: previousPeriodRevenue,
        growthPercentage,
      },
    };

    return {
      success: true,
      analytics,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi tạo phân tích doanh thu",
    };
  }
} 