"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, OrderItem, Product, Profile } from "@/types/custom.types";
import { z } from "zod";

// Validation schema for order filters
const orderFiltersSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]).optional(),
  payment_status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  date_from: z.string().optional(), // ISO date string
  date_to: z.string().optional(), // ISO date string
  customer_id: z.string().uuid().optional(),
  min_amount: z.number().min(0).optional(),
  max_amount: z.number().min(0).optional(),
  search_query: z.string().optional(), // Search in order number, customer name, email
});

// Validation schema
const exportOrdersSchema = z.object({
  filters: orderFiltersSchema.optional(),
  format: z.enum(["excel", "csv"], {
    required_error: "Định dạng xuất file là bắt buộc",
  }),
  include_items: z.boolean().optional().default(false), // Include order items details
  include_customer_info: z.boolean().optional().default(true),
  max_records: z.number().min(1).max(10000).optional().default(1000), // Limit to prevent large exports
});

type ExportOrdersData = z.infer<typeof exportOrdersSchema>;

// Order export data structure
type OrderExportData = Order & {
  customer?: Pick<Profile, "id" | "full_name" | "email"> | null;
  items?: Array<OrderItem & {
    product?: Pick<Product, "id" | "name" | "sku"> | null;
  }>;
  items_count?: number;
  items_summary?: string; // Brief summary of items
};

// Export result structure
type ExportResult = {
  file_name: string;
  file_size: number;
  total_records: number;
  export_date: string;
  format: string;
  download_url?: string; // If using cloud storage
  data?: OrderExportData[]; // Return data directly for now
};

// Return type
type ExportOrdersResult =
  | { success: true; message: string; export_info: ExportResult }
  | { success: false; error: string };

export async function exportOrders(data: ExportOrdersData): Promise<ExportOrdersResult> {
  try {
    // 1. Validate input
    const { filters, format, include_items, include_customer_info, max_records } = exportOrdersSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xuất dữ liệu đơn hàng",
      };
    }

    // 4. Check admin permissions
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return {
        success: false,
        error: "Bạn không có quyền xuất dữ liệu đơn hàng",
      };
    }

    // 5. Build query for orders
    let ordersQuery = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(max_records);

    // Apply filters
    if (filters) {
      if (filters.status) {
        ordersQuery = ordersQuery.eq("status", filters.status);
      }
      if (filters.payment_status) {
        ordersQuery = ordersQuery.eq("payment_status", filters.payment_status);
      }
      if (filters.date_from) {
        ordersQuery = ordersQuery.gte("created_at", filters.date_from);
      }
      if (filters.date_to) {
        ordersQuery = ordersQuery.lte("created_at", filters.date_to);
      }
      if (filters.customer_id) {
        ordersQuery = ordersQuery.eq("user_id", filters.customer_id);
      }
      if (filters.min_amount) {
        ordersQuery = ordersQuery.gte("total_amount", filters.min_amount);
      }
      if (filters.max_amount) {
        ordersQuery = ordersQuery.lte("total_amount", filters.max_amount);
      }
    }

    // Execute orders query
    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) {
      return {
        success: false,
        error: ordersError.message || "Không thể lấy dữ liệu đơn hàng",
      };
    }

    if (!orders || orders.length === 0) {
      return {
        success: false,
        error: "Không có đơn hàng nào phù hợp với điều kiện lọc",
      };
    }

    // 6. Filter by search query if provided (post-query filtering)
    let filteredOrders = orders;
    if (filters?.search_query) {
      const searchLower = filters.search_query.toLowerCase();
      
      // Get customer info for search - filter out null user_ids
      const userIds = orders.map(order => order.user_id).filter((id): id is string => id !== null);
      const { data: customers } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const customersMap = new Map<string, Pick<Profile, "id" | "full_name" | "email">>();
      customers?.forEach(customer => {
        customersMap.set(customer.id, customer);
      });

      filteredOrders = orders.filter(order => {
        const customer = order.user_id ? customersMap.get(order.user_id) : null;
        const orderNumberMatch = order.order_number.toLowerCase().includes(searchLower);
        const customerNameMatch = customer?.full_name?.toLowerCase().includes(searchLower) || false;
        const customerEmailMatch = customer?.email?.toLowerCase().includes(searchLower) || false;
        
        return orderNumberMatch || customerNameMatch || customerEmailMatch;
      });
    }

    // 7. Get customer information if requested
    const customersMap = new Map<string, Pick<Profile, "id" | "full_name" | "email">>();
    if (include_customer_info) {
      const userIds = filteredOrders.map(order => order.user_id).filter((id): id is string => id !== null);
      const uniqueUserIds = Array.from(new Set(userIds));
      
      const { data: customers, error: customersError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", uniqueUserIds);

      if (customersError) {
        console.error("Error fetching customers:", customersError);
      } else {
        customers?.forEach(customer => {
          customersMap.set(customer.id, customer);
        });
      }
    }

    // 8. Get order items if requested
    const orderItemsMap = new Map<number, Array<OrderItem & { product?: Pick<Product, "id" | "name" | "sku"> | null }>>();
    const itemsCountMap = new Map<number, number>();
    const itemsSummaryMap = new Map<number, string>();

    if (include_items) {
      const orderIds = filteredOrders.map(order => order.id);
      
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (!itemsError && orderItems) {
        // Get product details
        const productIds = orderItems.map(item => item.product_id);
        const uniqueProductIds = Array.from(new Set(productIds));
        
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, name, sku")
          .in("id", uniqueProductIds);

        const productsMap = new Map<number, Pick<Product, "id" | "name" | "sku">>();
        if (!productsError && products) {
          products.forEach(product => {
            productsMap.set(product.id, product);
          });
        }

        // Group items by order
        orderItems.forEach(item => {
          const product = productsMap.get(item.product_id) || null;
          const enrichedItem = { ...item, product };
          
          if (!orderItemsMap.has(item.order_id)) {
            orderItemsMap.set(item.order_id, []);
          }
          orderItemsMap.get(item.order_id)!.push(enrichedItem);
        });

        // Calculate counts and summaries
        orderItemsMap.forEach((items, orderId) => {
          itemsCountMap.set(orderId, items.length);
          
          const summary = items
            .map(item => `${item.product?.name || item.product_name} (x${item.quantity})`)
            .join(", ");
          itemsSummaryMap.set(orderId, summary);
        });
      }
    } else {
      // Just get items count without details
      const orderIds = filteredOrders.map(order => order.id);
      
      const { data: itemsCounts, error: countsError } = await supabase
        .from("order_items")
        .select("order_id")
        .in("order_id", orderIds);

      if (!countsError && itemsCounts) {
        const countsMap = itemsCounts.reduce((acc, item) => {
          acc[item.order_id] = (acc[item.order_id] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        Object.entries(countsMap).forEach(([orderId, count]) => {
          itemsCountMap.set(parseInt(orderId), count);
        });
      }
    }

    // 9. Prepare export data
    const exportData: OrderExportData[] = filteredOrders.map(order => {
      const orderData: OrderExportData = {
        ...order,
        items_count: itemsCountMap.get(order.id) || 0,
      };

      if (include_customer_info && order.user_id) {
        orderData.customer = customersMap.get(order.user_id) || null;
      }

      if (include_items) {
        orderData.items = orderItemsMap.get(order.id) || [];
        orderData.items_summary = itemsSummaryMap.get(order.id) || "";
      }

      return orderData;
    });

    // 10. Generate export file info
    const exportDate = new Date().toISOString();
    const fileName = `orders_export_${new Date().toISOString().split('T')[0]}_${Date.now()}.${format}`;
    
    // Calculate approximate file size (simplified)
    const estimatedSize = JSON.stringify(exportData).length;

    const exportResult: ExportResult = {
      file_name: fileName,
      file_size: estimatedSize,
      total_records: exportData.length,
      export_date: exportDate,
      format,
      data: exportData, // Return data directly for now
    };

    return {
      success: true,
      message: `Đã xuất ${exportData.length} đơn hàng thành công`,
      export_info: exportResult,
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
      error: "Đã xảy ra lỗi không mong muốn khi xuất dữ liệu đơn hàng",
    };
  }
} 