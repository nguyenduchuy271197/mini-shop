"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Date range type
type DateRange = {
  startDate: string;
  endDate: string;
};

type ReportGroupBy = "day" | "week" | "month" | "year";

// Schema validation cho date range
const salesReportSchema = z.object({
  startDate: z.string().datetime("Ngày bắt đầu không hợp lệ"),
  endDate: z.string().datetime("Ngày kết thúc không hợp lệ"),
  groupBy: z.enum(["day", "week", "month", "year"], {
    required_error: "Cách nhóm dữ liệu là bắt buộc",
    invalid_type_error: "Cách nhóm dữ liệu không hợp lệ"
  }).optional().default("day"),
}).refine((data) => {
  return new Date(data.endDate) > new Date(data.startDate);
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"]
});

type SalesReportItem = {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  refundedOrders: number;
  refundedAmount: number;
};

type SalesReportSummary = {
  totalOrders: number;
  totalRevenue: number;
  totalRefunds: number;
  averageOrderValue: number;
  totalCustomers: number;
  orderGrowth: number;
  revenueGrowth: number;
};

type GetSalesReportResult =
  | { 
      success: true; 
      data: SalesReportItem[];
      summary: SalesReportSummary;
    }
  | { success: false; error: string };

export async function getSalesReport(
  dateRange: DateRange,
  groupBy: ReportGroupBy = "day"
): Promise<GetSalesReportResult> {
  try {
    // Validate input
    const validatedData = salesReportSchema.parse({
      ...dateRange,
      groupBy,
    });

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
        error: "Chỉ admin mới có thể xem báo cáo bán hàng",
      };
    }

    // Lấy dữ liệu đơn hàng trong khoảng thời gian
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        discount_amount,
        status,
        user_id,
        created_at
      `)
      .gte("created_at", validatedData.startDate)
      .lte("created_at", validatedData.endDate)
      .order("created_at", { ascending: true });

    if (ordersError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu đơn hàng",
      };
    }

    // Lấy thông tin khách hàng mới trong khoảng thời gian
    const { data: newCustomersData, error: customersError } = await supabase
      .from("profiles")
      .select("id, created_at")
      .gte("created_at", validatedData.startDate)
      .lte("created_at", validatedData.endDate);

    if (customersError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu khách hàng",
      };
    }

    // Tạo map để nhóm dữ liệu theo thời gian
    const salesMap = new Map<string, SalesReportItem>();

    // Hàm để format period dựa trên groupBy
    const formatPeriod = (date: Date, groupBy: ReportGroupBy): string => {
      switch (groupBy) {
        case "day":
          return date.toISOString().split("T")[0]; // YYYY-MM-DD
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          return weekStart.toISOString().split("T")[0];
        case "month":
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        case "year":
          return String(date.getFullYear());
        default:
          return date.toISOString().split("T")[0];
      }
    };

    // Xử lý dữ liệu đơn hàng
    ordersData?.forEach(order => {
      const orderDate = new Date(order.created_at);
      const period = formatPeriod(orderDate, validatedData.groupBy);

      if (!salesMap.has(period)) {
        salesMap.set(period, {
          period,
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          totalCustomers: 0,
          newCustomers: 0,
          refundedOrders: 0,
          refundedAmount: 0,
        });
      }

      const periodData = salesMap.get(period)!;

      // Tính toán các metric
      if (order.status !== "cancelled") {
        periodData.totalOrders += 1;
        periodData.totalRevenue += order.total_amount;
      }

      if (order.status === "refunded") {
        periodData.refundedOrders += 1;
        periodData.refundedAmount += order.total_amount;
      }
    });

    // Xử lý khách hàng mới
    newCustomersData?.forEach(customer => {
      const customerDate = new Date(customer.created_at);
      const period = formatPeriod(customerDate, validatedData.groupBy);

      if (salesMap.has(period)) {
        salesMap.get(period)!.newCustomers += 1;
      }
    });

    // Tính average order value cho từng period
    salesMap.forEach(periodData => {
      if (periodData.totalOrders > 0) {
        periodData.averageOrderValue = Math.round(periodData.totalRevenue / periodData.totalOrders);
      }
      
      // Đếm unique customers cho period này
      const periodStart = new Date(periodData.period);
      const periodEnd = new Date(periodStart);
      
      switch (validatedData.groupBy) {
        case "day":
          periodEnd.setDate(periodEnd.getDate() + 1);
          break;
        case "week":
          periodEnd.setDate(periodEnd.getDate() + 7);
          break;
        case "month":
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          break;
        case "year":
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
      }

      const uniqueCustomers = new Set(
        ordersData
          ?.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= periodStart && orderDate < periodEnd && order.user_id;
          })
          .map(order => order.user_id)
      );
      
      periodData.totalCustomers = uniqueCustomers.size;
    });

    // Chuyển map thành array và sắp xếp
    const reportData = Array.from(salesMap.values()).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    // Tính tổng kết
    const summary: SalesReportSummary = {
      totalOrders: reportData.reduce((sum, item) => sum + item.totalOrders, 0),
      totalRevenue: reportData.reduce((sum, item) => sum + item.totalRevenue, 0),
      totalRefunds: reportData.reduce((sum, item) => sum + item.refundedAmount, 0),
      averageOrderValue: 0,
      totalCustomers: new Set(ordersData?.filter(o => o.user_id).map(o => o.user_id)).size,
      orderGrowth: 0,
      revenueGrowth: 0,
    };

    if (summary.totalOrders > 0) {
      summary.averageOrderValue = Math.round(summary.totalRevenue / summary.totalOrders);
    }

    // Tính growth (so với period trước đó nếu có đủ dữ liệu)
    if (reportData.length >= 2) {
      const lastPeriod = reportData[reportData.length - 1];
      const previousPeriod = reportData[reportData.length - 2];

      if (previousPeriod.totalOrders > 0) {
        summary.orderGrowth = Math.round(
          ((lastPeriod.totalOrders - previousPeriod.totalOrders) / previousPeriod.totalOrders) * 100
        );
      }

      if (previousPeriod.totalRevenue > 0) {
        summary.revenueGrowth = Math.round(
          ((lastPeriod.totalRevenue - previousPeriod.totalRevenue) / previousPeriod.totalRevenue) * 100
        );
      }
    }

    return {
      success: true,
      data: reportData,
      summary,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo báo cáo bán hàng",
    };
  }
} 