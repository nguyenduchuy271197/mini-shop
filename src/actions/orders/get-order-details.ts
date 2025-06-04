"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, OrderItem, Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getOrderDetailsSchema = z.object({
  orderId: z.number().positive("ID đơn hàng không hợp lệ"),
});

type GetOrderDetailsData = z.infer<typeof getOrderDetailsSchema>;

// Extended order item type with product info
type OrderItemWithProduct = OrderItem & {
  product?: Pick<Product, "id" | "name" | "slug" | "images" | "is_active"> | null;
};

// Extended order type with full details
type OrderDetails = Order & {
  order_items: OrderItemWithProduct[];
};

// Return type
type GetOrderDetailsResult =
  | { success: true; order: OrderDetails }
  | { success: false; error: string };

export async function getOrderDetails(data: GetOrderDetailsData): Promise<GetOrderDetailsResult> {
  try {
    // 1. Validate input
    const { orderId } = getOrderDetailsSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xem chi tiết đơn hàng",
      };
    }

    // 4. Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      if (orderError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy đơn hàng",
        };
      }
      return {
        success: false,
        error: orderError.message || "Không thể lấy thông tin đơn hàng",
      };
    }

    if (!order) {
      return {
        success: false,
        error: "Không tìm thấy đơn hàng",
      };
    }

    // 5. Authorization check - users can only see their own orders unless they're admin
    if (order.user_id !== user.id) {
      // Check if current user is admin
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !userRole || userRole.role !== "admin") {
        return {
          success: false,
          error: "Bạn không có quyền xem đơn hàng này",
        };
      }
    }

    // 6. Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("id", { ascending: true });

    if (itemsError) {
      return {
        success: false,
        error: itemsError.message || "Không thể lấy chi tiết sản phẩm trong đơn hàng",
      };
    }

    if (!orderItems || orderItems.length === 0) {
      return {
        success: false,
        error: "Đơn hàng không có sản phẩm nào",
      };
    }

    // 7. Get product details for order items
    const productIds = orderItems.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, slug, images, is_active")
      .in("id", productIds);

    if (productsError) {
      console.error("Error fetching product details:", productsError);
    }

    // Create a map of products for easy lookup
    const productsMap = new Map<number, Pick<Product, "id" | "name" | "slug" | "images" | "is_active">>();
    products?.forEach(product => {
      productsMap.set(product.id, product);
    });

    // 8. Combine order items with product details
    const orderItemsWithProducts: OrderItemWithProduct[] = orderItems.map(item => ({
      ...item,
      product: productsMap.get(item.product_id) || null,
    }));

    // 9. Prepare final order details
    const orderDetails: OrderDetails = {
      ...order,
      order_items: orderItemsWithProducts,
    };

    return {
      success: true,
      order: orderDetails,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy chi tiết đơn hàng",
    };
  }
} 