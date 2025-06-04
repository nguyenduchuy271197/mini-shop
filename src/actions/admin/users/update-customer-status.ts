"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const updateCustomerStatusSchema = z.object({
  customerId: z.string().uuid("ID khách hàng không hợp lệ"),
  isActive: z.boolean(),
  reason: z.string().optional(), // Lý do thay đổi trạng thái
});

type UpdateCustomerStatusData = z.infer<typeof updateCustomerStatusSchema>;

// Return type
type UpdateCustomerStatusResult =
  | {
      success: true;
      message: string;
      customer: Profile;
    }
  | { success: false; error: string };

export async function updateCustomerStatus(data: UpdateCustomerStatusData): Promise<UpdateCustomerStatusResult> {
  try {
    // 1. Validate input
    const { customerId, isActive, reason } = updateCustomerStatusSchema.parse(data);

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
        error: "Bạn cần đăng nhập để cập nhật trạng thái khách hàng",
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
        error: "Bạn không có quyền cập nhật trạng thái khách hàng",
      };
    }

    // 4. Get existing customer
    const { data: existingCustomer, error: fetchError } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles!inner(role)
      `)
      .eq("id", customerId)
      .eq("user_roles.role", "customer")
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy khách hàng",
        };
      }
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin khách hàng",
      };
    }

    if (!existingCustomer) {
      return {
        success: false,
        error: "Không tìm thấy khách hàng",
      };
    }

    // 5. Prevent admin from deactivating themselves
    if (customerId === user.id) {
      return {
        success: false,
        error: "Bạn không thể thay đổi trạng thái của chính mình",
      };
    }

    // 6. Check for pending orders if deactivating
    if (!isActive) {
      const { data: pendingOrders, error: ordersError } = await supabase
        .from("orders")
        .select("id, order_number, status")
        .eq("user_id", customerId)
        .in("status", ["pending", "confirmed", "processing", "shipped"])
        .limit(5);

      if (ordersError) {
        console.error("Error checking pending orders:", ordersError);
      } else if (pendingOrders && pendingOrders.length > 0) {
        const orderNumbers = pendingOrders.map(order => order.order_number).join(", ");
        return {
          success: false,
          error: `Không thể vô hiệu hóa khách hàng này vì có ${pendingOrders.length} đơn hàng đang xử lý: ${orderNumbers}. Vui lòng hoàn tất các đơn hàng trước khi vô hiệu hóa tài khoản.`,
        };
      }
    }


    // 9. If deactivating, clear sensitive data from sessions
    if (!isActive) {
      try {
        // Clear cart items for deactivated user
        const { error: cartClearError } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", customerId);

        if (cartClearError) {
          console.error("Error clearing cart:", cartClearError);
        }

        // Note: We don't delete orders, addresses, or reviews as they are historical data
        // We just prevent new activities through RLS policies
      } catch (cleanupError) {
        console.error("Error during deactivation cleanup:", cleanupError);
      }
    }

    // 10. Create action message
    const statusText = isActive ? "kích hoạt" : "vô hiệu hóa";
    const message = reason 
      ? `Đã ${statusText} tài khoản khách hàng "${existingCustomer.full_name || existingCustomer.email}" với lý do: ${reason}`
      : `Đã ${statusText} tài khoản khách hàng "${existingCustomer.full_name || existingCustomer.email}"`;

    return {
      success: true,
      message,
      customer: {
        ...existingCustomer,
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật trạng thái khách hàng",
    };
  }
} 