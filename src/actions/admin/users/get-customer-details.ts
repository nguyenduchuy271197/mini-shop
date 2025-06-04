"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile, Order, Address } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const getCustomerDetailsSchema = z.object({
  customerId: z.string().uuid("ID khách hàng không hợp lệ"),
});

type GetCustomerDetailsData = z.infer<typeof getCustomerDetailsSchema>;

// Extended customer details type
type CustomerDetails = Profile & {
  user_role: "customer" | "admin";
  statistics: {
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    last_order_date?: string;
    first_order_date?: string;
  };
  recent_orders: Order[];
  addresses: Address[];
  activity_summary: {
    items_in_cart: number;
    items_in_wishlist: number;
    reviews_count: number;
  };
};

// Return type
type GetCustomerDetailsResult =
  | {
      success: true;
      customer: CustomerDetails;
    }
  | { success: false; error: string };

export async function getCustomerDetails(data: GetCustomerDetailsData): Promise<GetCustomerDetailsResult> {
  try {
    // 1. Validate input
    const { customerId } = getCustomerDetailsSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xem chi tiết khách hàng",
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
        error: "Bạn không có quyền xem chi tiết khách hàng",
      };
    }

    // 4. Get customer profile with role
    const { data: customerProfile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles!inner(role)
      `)
      .eq("id", customerId)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy khách hàng",
        };
      }
      return {
        success: false,
        error: profileError.message || "Không thể lấy thông tin khách hàng",
      };
    }

    if (!customerProfile) {
      return {
        success: false,
        error: "Không tìm thấy khách hàng",
      };
    }

    // 5. Get order statistics
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, total_amount, created_at, status")
      .eq("user_id", customerId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    }

    const ordersList = orders || [];
    const statistics = {
      total_orders: ordersList.length,
      total_spent: ordersList.reduce((sum, order) => sum + Number(order.total_amount), 0),
      average_order_value: ordersList.length > 0 
        ? ordersList.reduce((sum, order) => sum + Number(order.total_amount), 0) / ordersList.length 
        : 0,
      last_order_date: ordersList.length > 0 ? ordersList[0].created_at : undefined,
      first_order_date: ordersList.length > 0 ? ordersList[ordersList.length - 1].created_at : undefined,
    };

    // 6. Get recent orders (last 5 orders)
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", customerId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentOrdersError) {
      console.error("Error fetching recent orders:", recentOrdersError);
    }

    // 7. Get customer addresses
    const { data: addresses, error: addressesError } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", customerId)
      .order("is_default", { ascending: false });

    if (addressesError) {
      console.error("Error fetching addresses:", addressesError);
    }

    // 8. Get activity summary
    
    // Cart items count
    const { count: cartItemsCount, error: cartError } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", customerId);

    if (cartError) {
      console.error("Error counting cart items:", cartError);
    }

    // Wishlist items count
    const { count: wishlistItemsCount, error: wishlistError } = await supabase
      .from("wishlists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", customerId);

    if (wishlistError) {
      console.error("Error counting wishlist items:", wishlistError);
    }

    // Reviews count
    const { count: reviewsCount, error: reviewsError } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", customerId);

    if (reviewsError) {
      console.error("Error counting reviews:", reviewsError);
    }

    const activity_summary = {
      items_in_cart: cartItemsCount || 0,
      items_in_wishlist: wishlistItemsCount || 0,
      reviews_count: reviewsCount || 0,
    };

    // 9. Combine all data
    const customerDetails: CustomerDetails = {
      ...customerProfile,
      user_role: "customer",
      statistics,
      recent_orders: recentOrders || [],
      addresses: addresses || [],
      activity_summary,
    };

    return {
      success: true,
      customer: customerDetails,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy chi tiết khách hàng",
    };
  }
} 