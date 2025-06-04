"use server";

import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const cancelOrderSchema = z.object({
  orderId: z.number().positive("ID đơn hàng không hợp lệ"),
  reason: z.string().optional(),
});

type CancelOrderData = z.infer<typeof cancelOrderSchema>;

// Return type
type CancelOrderResult =
  | { success: true; message: string; order: Pick<Order, "id" | "order_number" | "status" | "updated_at"> }
  | { success: false; error: string };

export async function cancelOrder(data: CancelOrderData): Promise<CancelOrderResult> {
  try {
    // 1. Validate input
    const { orderId, reason } = cancelOrderSchema.parse(data);

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
        error: "Bạn cần đăng nhập để hủy đơn hàng",
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

    // 5. Authorization check - users can only cancel their own orders unless they're admin
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
          error: "Bạn không có quyền hủy đơn hàng này",
        };
      }
    }

    // 6. Check if order can be cancelled
    const cancellableStatuses = ["pending", "confirmed"];
    if (!cancellableStatuses.includes(order.status)) {
      const statusMessages: Record<string, string> = {
        processing: "Đơn hàng đang được xử lý, không thể hủy",
        shipped: "Đơn hàng đã được giao cho đơn vị vận chuyển, không thể hủy",
        delivered: "Đơn hàng đã được giao, không thể hủy",
        cancelled: "Đơn hàng đã được hủy trước đó",
        refunded: "Đơn hàng đã được hoàn tiền",
      };

      return {
        success: false,
        error: statusMessages[order.status] || "Không thể hủy đơn hàng ở trạng thái hiện tại",
      };
    }

    // 7. Get order items to restore stock
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (itemsError) {
      return {
        success: false,
        error: itemsError.message || "Không thể lấy thông tin sản phẩm trong đơn hàng",
      };
    }

    // 8. Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        admin_notes: reason ? `Hủy đơn hàng: ${reason}` : "Đơn hàng đã được hủy",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id, order_number, status, updated_at")
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật trạng thái đơn hàng",
      };
    }

    if (!updatedOrder) {
      return {
        success: false,
        error: "Không thể cập nhật trạng thái đơn hàng",
      };
    }

    // 9. Restore product stock
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        // Get current stock
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.product_id)
          .single();

        if (!productError && product) {
          // Restore stock
          await supabase
            .from("products")
            .update({
              stock_quantity: product.stock_quantity + item.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.product_id);
        }
      }
    }

    // 10. Update coupon usage count if coupon was used
    if (order.coupon_id) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("used_count")
        .eq("id", order.coupon_id)
        .single();

      if (coupon && coupon.used_count > 0) {
        await supabase
          .from("coupons")
          .update({
            used_count: coupon.used_count - 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.coupon_id);
      }
    }

    return {
      success: true,
      message: "Đơn hàng đã được hủy thành công",
      order: updatedOrder,
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
      error: "Đã xảy ra lỗi không mong muốn khi hủy đơn hàng",
    };
  }
} 