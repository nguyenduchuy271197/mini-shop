"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, OrderItem, Product, Profile } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getPendingOrdersSchema = z.object({
  includeItems: z.boolean().optional().default(false),
  sortBy: z.enum(["created_at", "total_amount", "priority"]).optional().default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  urgentOnly: z.boolean().optional().default(false), // Chỉ đơn hàng khẩn cấp
});

type GetPendingOrdersData = z.infer<typeof getPendingOrdersSchema>;

// Extended order type
type PendingOrderWithDetails = Order & {
  customer?: Pick<Profile, "id" | "full_name" | "email" | "phone"> | null;
  order_items?: Array<OrderItem & {
    product?: Pick<Product, "id" | "name" | "slug" | "images" | "stock_quantity"> | null;
  }>;
  items_count?: number;
  total_items_quantity?: number;
  urgency_score?: number; // Điểm ưu tiên dựa trên thời gian và giá trị đơn hàng
  days_pending?: number;
  requires_attention?: boolean; // Cần chú ý đặc biệt
  stock_status?: "available" | "partial" | "unavailable"; // Trạng thái tồn kho
};

// Return type
type GetPendingOrdersResult =
  | {
      success: true;
      orders: PendingOrderWithDetails[];
      summary: {
        total_pending: number;
        urgent_count: number;
        total_value: number;
        average_wait_time: number; // Thời gian chờ trung bình (giờ)
        oldest_order_date: string | null;
        stock_issues_count: number;
      };
      alerts: Array<{
        type: "urgent" | "stock" | "old" | "high_value";
        message: string;
        order_ids: number[];
      }>;
    }
  | { success: false; error: string };

export async function getPendingOrders(data?: GetPendingOrdersData): Promise<GetPendingOrdersResult> {
  try {
    // 1. Set default values and validate if data provided
    const includeItems = data?.includeItems ?? false;
    const sortBy = data?.sortBy ?? "created_at";
    const sortOrder = data?.sortOrder ?? "asc";
    const urgentOnly = data?.urgentOnly ?? false;

    // Validate data if provided
    if (data) {
      getPendingOrdersSchema.parse(data);
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
        error: "Bạn cần đăng nhập để xem đơn hàng đang chờ xử lý",
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
        error: "Bạn không có quyền xem đơn hàng đang chờ xử lý",
      };
    }

    // 4. Get pending orders with customer information
    const { data: pendingOrders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        *,
        customer:profiles!user_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq("status", "pending")
      .order(sortBy, { ascending: sortOrder === "asc" });

    if (ordersError) {
      return {
        success: false,
        error: ordersError.message || "Không thể lấy danh sách đơn hàng đang chờ xử lý",
      };
    }

    if (!pendingOrders) {
      return {
        success: false,
        error: "Không tìm thấy đơn hàng đang chờ xử lý",
      };
    }

    // 5. Calculate urgency scores and additional metrics
    const currentTime = new Date();
    let ordersWithDetails: PendingOrderWithDetails[] = pendingOrders.map((order: Order) => {
      const orderTime = new Date(order.created_at);
      const daysPending = (currentTime.getTime() - orderTime.getTime()) / (1000 * 3600 * 24);
      const hoursPending = (currentTime.getTime() - orderTime.getTime()) / (1000 * 3600);
      
      // Calculate urgency score based on time and order value
      // Higher score = more urgent
      let urgencyScore = 0;
      
      // Time factor (more urgent as time passes)
      if (daysPending > 3) urgencyScore += 30; // Very old orders
      else if (daysPending > 1) urgencyScore += 20; // Old orders
      else if (hoursPending > 12) urgencyScore += 10; // Half day old
      
      // Value factor (high-value orders get priority)
      const orderValue = Number(order.total_amount);
      if (orderValue > 5000000) urgencyScore += 25; // >5M VND
      else if (orderValue > 2000000) urgencyScore += 15; // >2M VND
      else if (orderValue > 1000000) urgencyScore += 10; // >1M VND
      
      // Payment factor (paid orders get higher priority)
      if (order.payment_status === "paid") urgencyScore += 15;
      
      const requiresAttention = urgencyScore > 30 || daysPending > 2 || orderValue > 3000000;

      return {
        ...order,
        urgency_score: urgencyScore,
        days_pending: Math.round(daysPending * 10) / 10,
        requires_attention: requiresAttention,
      };
    });

    // 6. Filter urgent orders if requested
    if (urgentOnly) {
      ordersWithDetails = ordersWithDetails.filter(order => 
        (order.urgency_score || 0) > 25 || order.requires_attention
      );
    }

    // 7. Get order items and stock status if requested
    if (includeItems && ordersWithDetails.length > 0) {
      const orderIds = ordersWithDetails.map(order => order.id);

      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products (
            id,
            name,
            slug,
            images,
            stock_quantity
          )
        `)
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      } else if (orderItems) {
        // Group items by order_id and calculate stock status
        const itemsMap = orderItems.reduce((acc, item) => {
          if (!acc[item.order_id]) {
            acc[item.order_id] = [];
          }
          acc[item.order_id].push(item);
          return acc;
        }, {} as Record<number, typeof orderItems>);

        // Add items and stock status to orders
        ordersWithDetails = ordersWithDetails.map(order => {
          const items = itemsMap[order.id] || [];
          
          // Calculate stock status
          let stockStatus: "available" | "partial" | "unavailable" = "available";
          
          if (items.length > 0) {
            const stockIssues = items.filter(item => 
              !item.product || (item.product.stock_quantity || 0) < item.quantity
            );
            
            if (stockIssues.length === items.length) {
              stockStatus = "unavailable";
            } else if (stockIssues.length > 0) {
              stockStatus = "partial";
            }
          }

          return {
            ...order,
            order_items: items,
            items_count: items.length,
            total_items_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
            stock_status: stockStatus,
          };
        });
      }
    }

    // 8. Sort by urgency score if not specified otherwise
    if (sortBy === "priority") {
      ordersWithDetails.sort((a, b) => (b.urgency_score || 0) - (a.urgency_score || 0));
    }

    // 9. Calculate summary statistics
    const summary = {
      total_pending: ordersWithDetails.length,
      urgent_count: ordersWithDetails.filter(order => (order.urgency_score || 0) > 25).length,
      total_value: ordersWithDetails.reduce((sum, order) => sum + Number(order.total_amount), 0),
      average_wait_time: ordersWithDetails.length > 0
        ? ordersWithDetails.reduce((sum, order) => sum + ((order.days_pending || 0) * 24), 0) / ordersWithDetails.length
        : 0,
      oldest_order_date: ordersWithDetails.length > 0
        ? ordersWithDetails.reduce((oldest, order) => 
            order.created_at < oldest ? order.created_at : oldest, 
            ordersWithDetails[0].created_at
          )
        : null,
      stock_issues_count: ordersWithDetails.filter(order => 
        order.stock_status === "partial" || order.stock_status === "unavailable"
      ).length,
    };

    // 10. Generate alerts
    const alerts: Array<{
      type: "urgent" | "stock" | "old" | "high_value";
      message: string;
      order_ids: number[];
    }> = [];

    // Urgent orders alert
    const urgentOrders = ordersWithDetails.filter(order => (order.urgency_score || 0) > 35);
    if (urgentOrders.length > 0) {
      alerts.push({
        type: "urgent",
        message: `${urgentOrders.length} đơn hàng cần xử lý khẩn cấp`,
        order_ids: urgentOrders.map(order => order.id),
      });
    }

    // Old orders alert
    const oldOrders = ordersWithDetails.filter(order => (order.days_pending || 0) > 2);
    if (oldOrders.length > 0) {
      alerts.push({
        type: "old",
        message: `${oldOrders.length} đơn hàng đã chờ xử lý quá 2 ngày`,
        order_ids: oldOrders.map(order => order.id),
      });
    }

    // Stock issues alert
    const stockIssueOrders = ordersWithDetails.filter(order => 
      order.stock_status === "partial" || order.stock_status === "unavailable"
    );
    if (stockIssueOrders.length > 0) {
      alerts.push({
        type: "stock",
        message: `${stockIssueOrders.length} đơn hàng có vấn đề về tồn kho`,
        order_ids: stockIssueOrders.map(order => order.id),
      });
    }

    // High value orders alert
    const highValueOrders = ordersWithDetails.filter(order => Number(order.total_amount) > 5000000);
    if (highValueOrders.length > 0) {
      alerts.push({
        type: "high_value",
        message: `${highValueOrders.length} đơn hàng giá trị cao (>5M VND) đang chờ xử lý`,
        order_ids: highValueOrders.map(order => order.id),
      });
    }

    return {
      success: true,
      orders: ordersWithDetails,
      summary,
      alerts,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy đơn hàng đang chờ xử lý",
    };
  }
} 