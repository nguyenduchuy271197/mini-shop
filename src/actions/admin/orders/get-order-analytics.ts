"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho date range
const dateRangeSchema = z.object({
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), "Ngày bắt đầu không hợp lệ"),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), "Ngày kết thúc không hợp lệ"),
});

const getOrderAnalyticsSchema = z.object({
  dateRange: dateRangeSchema,
  groupBy: z.enum(["day", "week", "month"]).optional().default("day"),
  includeComparison: z.boolean().optional().default(false), // So sánh với kỳ trước
});

type GetOrderAnalyticsData = z.infer<typeof getOrderAnalyticsSchema>;

// Analytics data types
type OrderAnalyticsData = {
  date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_by_status: Record<string, number>;
  orders_by_payment_status: Record<string, number>;
};

type ComparisonData = {
  total_orders_change: number;
  total_revenue_change: number;
  average_order_value_change: number;
  change_percentage: {
    orders: number;
    revenue: number;
    aov: number;
  };
};

// Return type
type GetOrderAnalyticsResult =
  | {
      success: true;
      analytics: {
        period: {
          start_date: string;
          end_date: string;
          group_by: "day" | "week" | "month";
        };
        summary: {
          total_orders: number;
          total_revenue: number;
          average_order_value: number;
          unique_customers: number;
          orders_by_status: Record<string, number>;
          orders_by_payment_status: Record<string, number>;
          top_selling_products: Array<{
            product_id: number;
            product_name: string;
            quantity_sold: number;
            revenue: number;
          }>;
        };
        timeline: OrderAnalyticsData[];
        comparison?: ComparisonData;
      };
    }
  | { success: false; error: string };

export async function getOrderAnalytics(data: GetOrderAnalyticsData): Promise<GetOrderAnalyticsResult> {
  try {
    // 1. Validate input
    const { dateRange, groupBy, includeComparison } = getOrderAnalyticsSchema.parse(data);

    // Validate date range logic
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    if (startDate > endDate) {
      return {
        success: false,
        error: "Ngày bắt đầu phải trước ngày kết thúc",
      };
    }

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Check admin authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để xem thống kê đơn hàng",
      };
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return {
        success: false,
        error: "Bạn không có quyền xem thống kê đơn hàng",
      };
    }

    // 4. Get orders data for the specified period
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", dateRange.startDate)
      .lte("created_at", dateRange.endDate)
      .order("created_at", { ascending: true });

    if (ordersError) {
      return {
        success: false,
        error: ordersError.message || "Không thể lấy dữ liệu đơn hàng",
      };
    }

    const ordersList = orders || [];

    // 5. Calculate summary statistics
    const summary = {
      total_orders: ordersList.length,
      total_revenue: ordersList.reduce((sum, order) => sum + Number(order.total_amount), 0),
      average_order_value: ordersList.length > 0 
        ? ordersList.reduce((sum, order) => sum + Number(order.total_amount), 0) / ordersList.length 
        : 0,
      unique_customers: new Set(ordersList.map(order => order.user_id).filter(Boolean)).size,
      orders_by_status: ordersList.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      orders_by_payment_status: ordersList.reduce((acc, order) => {
        acc[order.payment_status] = (acc[order.payment_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      top_selling_products: [] as Array<{
        product_id: number;
        product_name: string;
        quantity_sold: number;
        revenue: number;
      }>,
    };

    // 6. Get top selling products
    if (ordersList.length > 0) {
      const orderIds = ordersList.map(order => order.id);

      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products (
            id,
            name
          )
        `)
        .in("order_id", orderIds);

      if (!itemsError && orderItems) {
        const productStats = orderItems.reduce((acc, item) => {
          const productId = item.product_id;
          const productName = item.product?.name || "Sản phẩm không tìm thấy";
          
          if (!acc[productId]) {
            acc[productId] = {
              product_id: productId,
              product_name: productName,
              quantity_sold: 0,
              revenue: 0,
            };
          }
          
          acc[productId].quantity_sold += item.quantity;
          acc[productId].revenue += Number(item.unit_price) * item.quantity;
          
          return acc;
        }, {} as Record<number, typeof summary.top_selling_products[0]>);

        summary.top_selling_products = Object.values(productStats)
          .sort((a, b) => b.quantity_sold - a.quantity_sold)
          .slice(0, 10);
      }
    }

    // 7. Generate timeline data grouped by specified period
    const timeline: OrderAnalyticsData[] = [];
    
    // Helper function to format date based on groupBy
    const formatDateKey = (date: Date, groupBy: string): string => {
      switch (groupBy) {
        case "day":
          return date.toISOString().split('T')[0];
        case "week":
          const week = new Date(date);
          week.setDate(date.getDate() - date.getDay());
          return week.toISOString().split('T')[0];
        case "month":
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        default:
          return date.toISOString().split('T')[0];
      }
    };

    // Group orders by date period
    const groupedOrders = ordersList.reduce((acc, order) => {
      const dateKey = formatDateKey(new Date(order.created_at), groupBy);
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(order);
      return acc;
    }, {} as Record<string, typeof ordersList>);

    // Generate timeline entries
    Object.entries(groupedOrders).forEach(([dateKey, orders]) => {
      timeline.push({
        date: dateKey,
        total_orders: orders.length,
        total_revenue: orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
        average_order_value: orders.length > 0 
          ? orders.reduce((sum, order) => sum + Number(order.total_amount), 0) / orders.length 
          : 0,
        orders_by_status: orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        orders_by_payment_status: orders.reduce((acc, order) => {
          acc[order.payment_status] = (acc[order.payment_status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      });
    });

    // Sort timeline by date
    timeline.sort((a, b) => a.date.localeCompare(b.date));

    // 8. Calculate comparison data if requested
    let comparison: ComparisonData | undefined;
    
    if (includeComparison) {
      // Calculate previous period of same length
      const periodLength = endDate.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodLength);
      const previousEndDate = new Date(endDate.getTime() - periodLength);

      const { data: previousOrders, error: previousOrdersError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", previousStartDate.toISOString())
        .lte("created_at", previousEndDate.toISOString());

      if (!previousOrdersError && previousOrders) {
        const previousSummary = {
          total_orders: previousOrders.length,
          total_revenue: previousOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
          average_order_value: previousOrders.length > 0 
            ? previousOrders.reduce((sum, order) => sum + Number(order.total_amount), 0) / previousOrders.length 
            : 0,
        };

        comparison = {
          total_orders_change: summary.total_orders - previousSummary.total_orders,
          total_revenue_change: summary.total_revenue - previousSummary.total_revenue,
          average_order_value_change: summary.average_order_value - previousSummary.average_order_value,
          change_percentage: {
            orders: previousSummary.total_orders > 0 
              ? ((summary.total_orders - previousSummary.total_orders) / previousSummary.total_orders) * 100 
              : 0,
            revenue: previousSummary.total_revenue > 0 
              ? ((summary.total_revenue - previousSummary.total_revenue) / previousSummary.total_revenue) * 100 
              : 0,
            aov: previousSummary.average_order_value > 0 
              ? ((summary.average_order_value - previousSummary.average_order_value) / previousSummary.average_order_value) * 100 
              : 0,
          },
        };
      }
    }

    return {
      success: true,
      analytics: {
        period: {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          group_by: groupBy,
        },
        summary,
        timeline,
        comparison,
      },
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy thống kê đơn hàng",
    };
  }
} 