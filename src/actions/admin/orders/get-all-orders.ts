"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, OrderItem, Product, Profile } from "@/types/custom.types";
import { z } from "zod";

// Define type for order with customer data from Supabase query
type OrderWithCustomer = Order & {
  customer: Pick<Profile, "id" | "full_name" | "email" | "phone"> | null;
};

// Define type for order item with product data from Supabase query
type OrderItemWithProduct = OrderItem & {
  product: Pick<Product, "id" | "name" | "slug" | "images"> | null;
};

// Validation schema cho order filters
const orderFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  search: z.string().optional(), // Search by order number, customer name, or email
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  customerId: z.string().uuid().optional(),
  shippingMethod: z.string().optional(),
}).optional();

const getAllOrdersSchema = z.object({
  pagination: z.object({
    page: z.number().int().min(1, "Trang phải lớn hơn 0"),
    limit: z.number().int().min(1, "Số lượng phải lớn hơn 0").max(100, "Số lượng tối đa 100"),
  }),
  filters: orderFiltersSchema,
  includeItems: z.boolean().optional().default(false),
  includeCustomer: z.boolean().optional().default(true),
});

type GetAllOrdersData = z.infer<typeof getAllOrdersSchema>;

// Extended order type với thông tin bổ sung
type OrderWithDetails = Order & {
  customer?: Pick<Profile, "id" | "full_name" | "email" | "phone"> | null;
  order_items?: OrderItemWithProduct[];
  items_count?: number;
  total_items_quantity?: number;
};

// Return type
type GetAllOrdersResult =
  | {
      success: true;
      orders: OrderWithDetails[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      summary: {
        total_orders: number;
        total_revenue: number;
        average_order_value: number;
        orders_by_status: Record<string, number>;
        orders_by_payment_status: Record<string, number>;
      };
    }
  | { success: false; error: string };

export async function getAllOrders(data: GetAllOrdersData): Promise<GetAllOrdersResult> {
  try {
    // 1. Validate input
    const { pagination, filters, includeItems, includeCustomer } = getAllOrdersSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xem danh sách đơn hàng",
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
        error: "Bạn không có quyền xem danh sách đơn hàng",
      };
    }

    // 4. Build base query - get orders only
    let ordersQuery = supabase
      .from("orders")
      .select("*");

    // 5. Apply filters
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

      if (filters.customerId) {
        ordersQuery = ordersQuery.eq("user_id", filters.customerId);
      }

      if (filters.shippingMethod) {
        ordersQuery = ordersQuery.eq("shipping_method", filters.shippingMethod);
      }
    }

    // 6. Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return {
        success: false,
        error: countError.message || "Không thể đếm số lượng đơn hàng",
      };
    }

    if (totalCount === null) {
      return {
        success: false,
        error: "Không thể đếm số lượng đơn hàng",
      };
    }

    // 7. Get orders with pagination
    const offset = (pagination.page - 1) * pagination.limit;

    const { data: orders, error: ordersError } = await ordersQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + pagination.limit - 1);

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

    // 8. Get customer information separately and combine with orders
    const userIds = (orders || []).map(order => order.user_id).filter(Boolean) as string[];
    const customerData: Map<string, Pick<Profile, "id" | "full_name" | "email" | "phone">> = new Map();
    
    if (includeCustomer && userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", userIds);
      
      if (profiles) {
        profiles.forEach(profile => {
          customerData.set(profile.id, {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone,
          });
        });
      }
    }

    // Create typed orders with customer data
    const typedOrders: OrderWithCustomer[] = (orders || []).map(order => ({
      ...order,
      customer: order.user_id && includeCustomer ? customerData.get(order.user_id) || null : null,
    }));

    // Apply search filter if provided
    let filteredOrders = typedOrders;
    if (filters?.search && includeCustomer) {
      const searchLower = filters.search.toLowerCase();
      filteredOrders = typedOrders.filter(order => {
        return (
          order.order_number?.toLowerCase().includes(searchLower) ||
          (order.customer?.full_name?.toLowerCase().includes(searchLower)) ||
          (order.customer?.email?.toLowerCase().includes(searchLower))
        );
      });
    }

    // 9. Get order items if requested
    let ordersWithDetails: OrderWithDetails[] = filteredOrders;

    if (includeItems && filteredOrders.length > 0) {
      const orderIds = filteredOrders.map(order => order.id);

      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      } else if (orderItems) {
        // Get product information for order items
        const productIds = orderItems.map(item => item.product_id);
        const { data: products } = await supabase
          .from("products")
          .select("id, name, slug, images")
          .in("id", productIds);

        const productMap = new Map(products?.map(p => [p.id, p]) || []);

        // Group items by order_id
        const itemsMap = orderItems.reduce((acc, item) => {
          if (!acc[item.order_id]) {
            acc[item.order_id] = [];
          }
          acc[item.order_id].push({
            ...item,
            product: productMap.get(item.product_id) || null,
          });
          return acc;
        }, {} as Record<number, Array<OrderItem & { product: Pick<Product, "id" | "name" | "slug" | "images"> | null }>>);

        // Add items to orders
        ordersWithDetails = filteredOrders.map(order => {
          const items = itemsMap[order.id] || [];
          return {
            ...order,
            order_items: items,
            items_count: items.length,
            total_items_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
          } as OrderWithDetails;
        });
      }
    }

    // 10. Calculate summary statistics (for all orders, not just current page)
    const { data: allOrders, error: allOrdersError } = await supabase
      .from("orders")
      .select("status, payment_status, total_amount");

    if (allOrdersError) {
      console.error("Error fetching all orders for summary:", allOrdersError);
    }

    const allOrdersList = allOrders || [];
    const summary = {
      total_orders: allOrdersList.length,
      total_revenue: allOrdersList.reduce((sum, order) => sum + Number(order.total_amount), 0),
      average_order_value: allOrdersList.length > 0 
        ? allOrdersList.reduce((sum, order) => sum + Number(order.total_amount), 0) / allOrdersList.length 
        : 0,
      orders_by_status: allOrdersList.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      orders_by_payment_status: allOrdersList.reduce((acc, order) => {
        acc[order.payment_status] = (acc[order.payment_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // 11. Calculate pagination info
    const totalPages = Math.ceil(totalCount / pagination.limit);

    return {
      success: true,
      orders: ordersWithDetails,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: totalCount,
        totalPages,
      },
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách đơn hàng",
    };
  }
} 