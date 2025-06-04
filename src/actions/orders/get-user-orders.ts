"use server";

import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getUserOrdersSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ").optional(),
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]).optional(),
  pagination: z.object({
    page: z.number().min(1, "Trang phải lớn hơn 0"),
    limit: z.number().min(1, "Số lượng phải lớn hơn 0").max(100, "Số lượng tối đa là 100"),
  }).optional(),
});

type GetUserOrdersData = z.infer<typeof getUserOrdersSchema>;

// Extended order type with basic order info
type OrderSummary = Pick<Order, 
  "id" | "order_number" | "status" | "payment_status" | "total_amount" | 
  "created_at" | "updated_at" | "shipped_at" | "delivered_at"
> & {
  items_count: number;
};

// Return type
type GetUserOrdersResult =
  | { 
      success: true; 
      orders: OrderSummary[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }
  | { success: false; error: string };

export async function getUserOrders(data?: GetUserOrdersData): Promise<GetUserOrdersResult> {
  try {
    // 1. Validate input
    const { userId, status, pagination } = data ? getUserOrdersSchema.parse(data) : {
      userId: undefined,
      status: undefined,
      pagination: { page: 1, limit: 10 },
    };

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để xem đơn hàng",
      };
    }

    // 4. Determine which user's orders to fetch
    const targetUserId = userId || user.id;

    // 5. Authorization check - users can only see their own orders unless they're admin
    if (targetUserId !== user.id) {
      // Check if current user is admin (simplified check - you may want to use proper RBAC)
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !userRole || userRole.role !== "admin") {
        return {
          success: false,
          error: "Bạn không có quyền xem đơn hàng của người dùng khác",
        };
      }
    }

    // 6. Set pagination defaults
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const offset = (page - 1) * limit;

    // 7. Build query for orders count
    let countQuery = supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId);

    if (status) {
      countQuery = countQuery.eq("status", status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      return {
        success: false,
        error: countError.message || "Không thể đếm số đơn hàng",
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // 8. Build query for orders data
    let ordersQuery = supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at,
        updated_at,
        shipped_at,
        delivered_at
      `)
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      ordersQuery = ordersQuery.eq("status", status);
    }

    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) {
      return {
        success: false,
        error: ordersError.message || "Không thể lấy danh sách đơn hàng",
      };
    }

    if (!orders) {
      return {
        success: true,
        orders: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // 9. Get items count for each order
    const orderIds = orders.map(order => order.id);
    
    const { data: orderItemsCounts, error: itemsCountError } = await supabase
      .from("order_items")
      .select("order_id")
      .in("order_id", orderIds);

    if (itemsCountError) {
      console.error("Error counting order items:", itemsCountError);
    }

    // Count items per order
    const itemsCountMap = orderItemsCounts?.reduce((acc, item) => {
      acc[item.order_id] = (acc[item.order_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>) || {};

    // 10. Prepare response
    const ordersWithItemsCount: OrderSummary[] = orders.map(order => ({
      ...order,
      items_count: itemsCountMap[order.id] || 0,
    }));

    return {
      success: true,
      orders: ordersWithItemsCount,
      pagination: {
        page,
        limit,
        total,
        totalPages,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách đơn hàng",
    };
  }
} 