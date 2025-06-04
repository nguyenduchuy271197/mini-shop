"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, OrderUpdateDto } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const addTrackingNumberSchema = z.object({
  orderId: z.number().positive("ID đơn hàng không hợp lệ"),
  trackingNumber: z.string().min(1, "Mã vận đơn không được để trống").max(100, "Mã vận đơn quá dài"),
  carrier: z.string().optional(), // Đơn vị vận chuyển
  estimatedDelivery: z.string().optional(), // Dự kiến giao hàng
});

type AddTrackingNumberData = z.infer<typeof addTrackingNumberSchema>;

// Return type
type AddTrackingNumberResult =
  | { 
      success: true; 
      message: string; 
      order: Pick<Order, "id" | "order_number" | "tracking_number" | "status" | "shipped_at" | "updated_at"> 
    }
  | { success: false; error: string };

export async function addTrackingNumber(data: AddTrackingNumberData): Promise<AddTrackingNumberResult> {
  try {
    // 1. Validate input
    const { orderId, trackingNumber, carrier, estimatedDelivery } = addTrackingNumberSchema.parse(data);

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
        error: "Bạn cần đăng nhập để thêm mã vận đơn",
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
        error: "Bạn không có quyền thêm mã vận đơn",
      };
    }

    // 5. Get current order details
    const { data: currentOrder, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, status, tracking_number")
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

    // 6. Check if order can have tracking number added
    const allowedStatuses = ["confirmed", "processing", "shipped"];
    if (!allowedStatuses.includes(currentOrder.status)) {
      const statusMessages: Record<string, string> = {
        pending: "Đơn hàng chưa được xác nhận",
        delivered: "Đơn hàng đã được giao",
        cancelled: "Đơn hàng đã bị hủy",
        refunded: "Đơn hàng đã được hoàn tiền",
      };

      return {
        success: false,
        error: statusMessages[currentOrder.status] || "Không thể thêm mã vận đơn cho đơn hàng ở trạng thái hiện tại",
      };
    }

    // 7. Prepare update data
    const updateData: OrderUpdateDto = {
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString(),
    };

    // Set status to shipped if it's not already shipped
    if (currentOrder.status !== "shipped") {
      updateData.status = "shipped";
      updateData.shipped_at = new Date().toISOString();
    }

    // Add carrier and estimated delivery to admin notes if provided
    const additionalNotes: string[] = [];
    if (carrier) {
      additionalNotes.push(`Đơn vị vận chuyển: ${carrier}`);
    }
    if (estimatedDelivery) {
      additionalNotes.push(`Dự kiến giao hàng: ${estimatedDelivery}`);
    }
    if (additionalNotes.length > 0) {
      updateData.admin_notes = additionalNotes.join(". ");
    }

    // 8. Update order with tracking number
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select("id, order_number, tracking_number, status, shipped_at, updated_at")
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật mã vận đơn",
      };
    }

    if (!updatedOrder) {
      return {
        success: false,
        error: "Không thể cập nhật mã vận đơn",
      };
    }

    return {
      success: true,
      message: `Đã thêm mã vận đơn ${trackingNumber} cho đơn hàng ${currentOrder.order_number}`,
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
      error: "Đã xảy ra lỗi không mong muốn khi thêm mã vận đơn",
    };
  }
} 