"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, OrderUpdateDto } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const updateOrderStatusSchema = z.object({
  orderId: z.number().positive("ID đơn hàng không hợp lệ"),
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"], {
    required_error: "Trạng thái đơn hàng là bắt buộc",
    invalid_type_error: "Trạng thái đơn hàng không hợp lệ",
  }),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(), // For shipped status
});

type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;

// Return type
type UpdateOrderStatusResult =
  | { 
      success: true; 
      message: string; 
      order: Pick<Order, "id" | "order_number" | "status" | "tracking_number" | "updated_at" | "shipped_at" | "delivered_at"> 
    }
  | { success: false; error: string };

export async function updateOrderStatus(data: UpdateOrderStatusData): Promise<UpdateOrderStatusResult> {
  try {
    // 1. Validate input
    const { orderId, status, notes, trackingNumber } = updateOrderStatusSchema.parse(data);

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
        error: "Bạn cần đăng nhập để cập nhật trạng thái đơn hàng",
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
        error: "Bạn không có quyền cập nhật trạng thái đơn hàng",
      };
    }

    // 5. Get current order details
    const { data: currentOrder, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, status, user_id")
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

    if (!currentOrder) {
      return {
        success: false,
        error: "Không tìm thấy đơn hàng",
      };
    }

    // 6. Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [], // No further transitions
      cancelled: [], // No further transitions
      refunded: [], // No further transitions
    };

    if (!validTransitions[currentOrder.status]?.includes(status) && currentOrder.status !== status) {
      return {
        success: false,
        error: `Không thể chuyển từ trạng thái "${currentOrder.status}" sang "${status}"`,
      };
    }

    // 7. Prepare update data
    const updateData: OrderUpdateDto = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add admin notes if provided
    if (notes) {
      updateData.admin_notes = notes;
    }

    // Add tracking number if provided and status is shipped
    if (status === "shipped" && trackingNumber) {
      updateData.tracking_number = trackingNumber;
      updateData.shipped_at = new Date().toISOString();
    } else if (status === "shipped") {
      updateData.shipped_at = new Date().toISOString();
    }

    // Add delivered date if status is delivered
    if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    // 8. Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select("id, order_number, status, tracking_number, updated_at, shipped_at, delivered_at")
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

    // 9. Generate success message
    const statusMessages: Record<string, string> = {
      confirmed: "Đã xác nhận đơn hàng",
      processing: "Đơn hàng đang được xử lý",
      shipped: "Đơn hàng đã được giao cho đơn vị vận chuyển",
      delivered: "Đơn hàng đã được giao thành công",
      cancelled: "Đơn hàng đã bị hủy",
      refunded: "Đơn hàng đã được hoàn tiền",
    };

    const message = statusMessages[status] || "Đã cập nhật trạng thái đơn hàng";

    return {
      success: true,
      message,
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật trạng thái đơn hàng",
    };
  }
} 