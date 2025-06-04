"use server";

import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types/custom.types";
import { z } from "zod";

// Validation schema for address
const addressSchema = z.object({
  first_name: z.string().min(1, "Tên không được để trống"),
  last_name: z.string().min(1, "Họ không được để trống"),
  company: z.string().optional(),
  address_line_1: z.string().min(1, "Địa chỉ không được để trống"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "Thành phố không được để trống"),
  state: z.string().min(1, "Tỉnh/Bang không được để trống"),
  postal_code: z.string().min(1, "Mã bưu chính không được để trống"),
  country: z.string().min(1, "Quốc gia không được để trống"),
  phone: z.string().optional(),
});

// Validation schema
const updateShippingAddressSchema = z.object({
  orderId: z.number().positive("ID đơn hàng không hợp lệ"),
  address: addressSchema,
});

type UpdateShippingAddressData = z.infer<typeof updateShippingAddressSchema>;

// Return type
type UpdateShippingAddressResult =
  | { 
      success: true; 
      message: string; 
      order: Pick<Order, "id" | "order_number" | "shipping_address" | "updated_at"> 
    }
  | { success: false; error: string };

export async function updateOrderShippingAddress(data: UpdateShippingAddressData): Promise<UpdateShippingAddressResult> {
  try {
    // 1. Validate input
    const { orderId, address } = updateShippingAddressSchema.parse(data);

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
        error: "Bạn cần đăng nhập để cập nhật địa chỉ giao hàng",
      };
    }

    // 4. Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, order_number, status, shipping_address")
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

    // 5. Authorization check - users can only update their own orders unless they're admin
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
          error: "Bạn không có quyền cập nhật đơn hàng này",
        };
      }
    }

    // 6. Check if order can be updated
    const updatableStatuses = ["pending", "confirmed"];
    if (!updatableStatuses.includes(order.status)) {
      const statusMessages: Record<string, string> = {
        processing: "Đơn hàng đang được xử lý, không thể thay đổi địa chỉ giao hàng",
        shipped: "Đơn hàng đã được giao cho đơn vị vận chuyển, không thể thay đổi địa chỉ",
        delivered: "Đơn hàng đã được giao, không thể thay đổi địa chỉ",
        cancelled: "Đơn hàng đã bị hủy",
        refunded: "Đơn hàng đã được hoàn tiền",
      };

      return {
        success: false,
        error: statusMessages[order.status] || "Không thể cập nhật địa chỉ giao hàng ở trạng thái hiện tại",
      };
    }

    // 7. Update shipping address
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        shipping_address: address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id, order_number, shipping_address, updated_at")
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật địa chỉ giao hàng",
      };
    }

    if (!updatedOrder) {
      return {
        success: false,
        error: "Không thể cập nhật địa chỉ giao hàng",
      };
    }

    return {
      success: true,
      message: "Địa chỉ giao hàng đã được cập nhật thành công",
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
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật địa chỉ giao hàng",
    };
  }
} 