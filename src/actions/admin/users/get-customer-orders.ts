"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, OrderItem, Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getCustomerOrdersSchema = z.object({
  customerId: z.string().uuid("ID khách hàng không hợp lệ"),
  pagination: z.object({
    page: z.number().int().min(1, "Trang phải lớn hơn 0"),
    limit: z.number().int().min(1, "Số lượng phải lớn hơn 0").max(50, "Số lượng tối đa 50"),
  }).optional(),
  filters: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    dateFrom: z.string().optional(), // ISO date string
    dateTo: z.string().optional(), // ISO date string
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().min(0).optional(),
  }).optional(),
  includeItems: z.boolean().optional().default(true),
});

type GetCustomerOrdersData = z.infer<typeof getCustomerOrdersSchema>;

// Extended order type với order items
type OrderWithItems = Order & {
  order_items?: Array<OrderItem & {
    product?: Pick<Product, "id" | "name" | "slug" | "images"> | null;
  }>;
  items_count?: number;
  total_items_quantity?: number;
};

// Return type
type GetCustomerOrdersResult =
  | {
      success: true;
      orders: OrderWithItems[];
      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      summary: {
        total_orders: number;
        total_spent: number;
        average_order_value: number;
        orders_by_status: Record<string, number>;
      };
    }
  | { success: false; error: string };

export async function getCustomerOrders(data: GetCustomerOrdersData): Promise<GetCustomerOrdersResult> {
  try {
    // 1. Validate input
    const { customerId, pagination, filters, includeItems } = getCustomerOrdersSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xem đơn hàng khách hàng",
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
        error: "Bạn không có quyền xem đơn hàng khách hàng",
      };
    }

    // 4. Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", customerId)
      .single();

    if (customerError) {
      if (customerError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy khách hàng",
        };
      }
      return {
        success: false,
        error: customerError.message || "Không thể lấy thông tin khách hàng",
      };
    }

    if (!customer) {
      return {
        success: false,
        error: "Không tìm thấy khách hàng",
      };
    }

    // 5. Build orders query
    let ordersQuery = supabase
      .from("orders")
      .select("*")
      .eq("user_id", customerId);

    // Apply filters
    if (filters) {
      if (filters.status) {
        ordersQuery = ordersQuery.eq("status", filters.status);
      }

      if (filters.paymentStatus) {
        ordersQuery = ordersQuery.eq("payment_status", filters.paymentStatus);
      }

      if (filters.dateFrom) {
        ordersQuery = ordersQuery.gte("created_at", filters.dateFrom);
      }

      if (filters.dateTo) {
        ordersQuery = ordersQuery.lte("created_at", filters.dateTo);
      }

      if (filters.minAmount !== undefined) {
        ordersQuery = ordersQuery.gte("total_amount", filters.minAmount);
      }

      if (filters.maxAmount !== undefined) {
        ordersQuery = ordersQuery.lte("total_amount", filters.maxAmount);
      }
    }

    // 6. Get total count for pagination (if pagination is requested)
    let totalCount: number | null = null;
    if (pagination) {
      const { count, error: countError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", customerId);

      if (countError) {
        return {
          success: false,
          error: countError.message || "Không thể đếm số lượng đơn hàng",
        };
      }

      totalCount = count;
    }

    // 7. Get orders with pagination (if requested)
    if (pagination && totalCount !== null) {
      const offset = (pagination.page - 1) * pagination.limit;
      ordersQuery = ordersQuery
        .order("created_at", { ascending: false })
        .range(offset, offset + pagination.limit - 1);
    } else {
      ordersQuery = ordersQuery.order("created_at", { ascending: false });
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
        success: false,
        error: "Không tìm thấy đơn hàng",
      };
    }

    // 8. Get order items if requested
    let ordersWithItems: OrderWithItems[] = orders;

    if (includeItems && orders.length > 0) {
      const orderIds = orders.map(order => order.id);

      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          product:products (
            id,
            name,
            slug,
            images
          )
        `)
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      } else if (orderItems) {
        // Group items by order_id
        const itemsMap = orderItems.reduce((acc, item) => {
          if (!acc[item.order_id]) {
            acc[item.order_id] = [];
          }
          acc[item.order_id].push(item);
          return acc;
        }, {} as Record<number, typeof orderItems>);

        // Add items to orders
        ordersWithItems = orders.map(order => {
          const items = itemsMap[order.id] || [];
          return {
            ...order,
            order_items: items,
            items_count: items.length,
            total_items_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
      }
    }

    // 9. Calculate summary statistics (for all orders, not just current page)
    const { data: allOrders, error: allOrdersError } = await supabase
      .from("orders")
      .select("status, total_amount")
      .eq("user_id", customerId);

    if (allOrdersError) {
      console.error("Error fetching all orders for summary:", allOrdersError);
    }

    const allOrdersList = allOrders || [];
    const summary = {
      total_orders: allOrdersList.length,
      total_spent: allOrdersList.reduce((sum, order) => sum + Number(order.total_amount), 0),
      average_order_value: allOrdersList.length > 0 
        ? allOrdersList.reduce((sum, order) => sum + Number(order.total_amount), 0) / allOrdersList.length 
        : 0,
      orders_by_status: allOrdersList.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // 10. Prepare response
    const response: GetCustomerOrdersResult = {
      success: true,
      orders: ordersWithItems,
      summary,
    };

    // Add pagination info if requested
    if (pagination && totalCount !== null) {
      response.pagination = {
        page: pagination.page,
        limit: pagination.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pagination.limit),
      };
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi lấy đơn hàng khách hàng",
    };
  }
} 