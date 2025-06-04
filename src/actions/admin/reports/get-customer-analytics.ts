"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Date range type
type DateRange = {
  startDate: string;
  endDate: string;
};

// Schema validation
const customerAnalyticsSchema = z.object({
  startDate: z.string().datetime("Ngày bắt đầu không hợp lệ"),
  endDate: z.string().datetime("Ngày kết thúc không hợp lệ"),
}).refine((data) => {
  return new Date(data.endDate) > new Date(data.startDate);
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"]
});

type CustomerAnalytics = {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
  }>;
  customerSegments: {
    newCustomers: number;
    activeCustomers: number;
    vipCustomers: number;
    dormantCustomers: number;
  };
  orderFrequency: {
    oneTime: number;
    twotoFive: number;
    sixToTen: number;
    moreThanTen: number;
  };
};

type GetCustomerAnalyticsResult =
  | { success: true; analytics: CustomerAnalytics }
  | { success: false; error: string };

export async function getCustomerAnalytics(
  dateRange: DateRange
): Promise<GetCustomerAnalyticsResult> {
  try {
    // Validate input
    const validatedData = customerAnalyticsSchema.parse(dateRange);

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
        error: "Chỉ admin mới có thể xem phân tích khách hàng",
      };
    }

    // Lấy tất cả customers
    const { data: allCustomers, error: customersError } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at");

    if (customersError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu khách hàng",
      };
    }

    // Lấy đơn hàng trong khoảng thời gian
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        total_amount,
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

    // Lấy tất cả đơn hàng (để tính customer lifetime value)
    const { data: allOrdersData, error: allOrdersError } = await supabase
      .from("orders")
      .select("user_id, total_amount, status, created_at")
      .neq("status", "cancelled");

    if (allOrdersError) {
      return {
        success: false,
        error: "Lỗi khi lấy toàn bộ dữ liệu đơn hàng",
      };
    }

    // Tính toán metrics
    const totalCustomers = allCustomers?.length || 0;
    
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);
    
    // Khách hàng mới trong khoảng thời gian
    const newCustomers = allCustomers?.filter(customer => {
      const createdAt = new Date(customer.created_at);
      return createdAt >= startDate && createdAt <= endDate;
    }).length || 0;

    // Khách hàng có đơn hàng trong khoảng thời gian
    const customersWithOrders = new Set(ordersData?.map(order => order.user_id).filter(Boolean));
    const activeCustomers = customersWithOrders.size;

    // Khách hàng returning (đã có đơn hàng trước khoảng thời gian)
    const existingCustomerIds = new Set(
      allOrdersData?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate < startDate && order.user_id;
      }).map(order => order.user_id)
    );

    const returningCustomers = Array.from(customersWithOrders).filter(
      customerId => existingCustomerIds.has(customerId)
    ).length;

    // Customer retention rate
    const customerRetentionRate = existingCustomerIds.size > 0 
      ? Math.round((returningCustomers / existingCustomerIds.size) * 100) 
      : 0;

    // Average order value
    const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const totalOrders = ordersData?.length || 0;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Customer lifetime value
    const customerLifetimeValue = totalCustomers > 0 
      ? Math.round((allOrdersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0) / totalCustomers)
      : 0;

    // Tính toán cho từng customer
    const customerMap = new Map();
    
    allOrdersData?.forEach(order => {
      if (!order.user_id) return;
      
      if (!customerMap.has(order.user_id)) {
        customerMap.set(order.user_id, {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.created_at,
        });
      }
      
      const customerData = customerMap.get(order.user_id);
      customerData.totalOrders += 1;
      customerData.totalSpent += order.total_amount;
      
      if (new Date(order.created_at) > new Date(customerData.lastOrderDate)) {
        customerData.lastOrderDate = order.created_at;
      }
    });

    // Top customers
    const topCustomersData = Array.from(customerMap.entries())
      .sort(([, a], [, b]) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(([userId, data]) => {
        const customer = allCustomers?.find(c => c.id === userId);
        return {
          id: userId,
          name: customer?.full_name || "Unknown",
          email: customer?.email || "Unknown",
          totalOrders: data.totalOrders,
          totalSpent: data.totalSpent,
          lastOrderDate: data.lastOrderDate,
        };
      });

    // Customer segments
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    let vipCustomers = 0;
    let dormantCustomers = 0;

    customerMap.forEach((data) => {
      const lastOrderDate = new Date(data.lastOrderDate);
      
      // VIP: đã chi trên 10 triệu VND
      if (data.totalSpent >= 10000000) {
        vipCustomers++;
      }
      
      // Dormant: không mua hàng trong 90 ngày
      if (lastOrderDate < ninetyDaysAgo) {
        dormantCustomers++;
      }
    });

    // Order frequency distribution
    let oneTime = 0;
    let twotoFive = 0;
    let sixToTen = 0;
    let moreThanTen = 0;

    customerMap.forEach(data => {
      if (data.totalOrders === 1) oneTime++;
      else if (data.totalOrders <= 5) twotoFive++;
      else if (data.totalOrders <= 10) sixToTen++;
      else moreThanTen++;
    });

    const analytics: CustomerAnalytics = {
      totalCustomers,
      newCustomers,
      returningCustomers,
      customerRetentionRate,
      averageOrderValue,
      customerLifetimeValue,
      topCustomers: topCustomersData,
      customerSegments: {
        newCustomers,
        activeCustomers,
        vipCustomers,
        dormantCustomers,
      },
      orderFrequency: {
        oneTime,
        twotoFive,
        sixToTen,
        moreThanTen,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo phân tích khách hàng",
    };
  }
} 