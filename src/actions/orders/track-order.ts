"use server";

import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, "Số đơn hàng không được để trống"),
});

type TrackOrderData = z.infer<typeof trackOrderSchema>;

// Order tracking info type
type OrderTrackingInfo = Pick<Order, 
  "id" | "order_number" | "status" | "payment_status" | "total_amount" | 
  "tracking_number" | "shipping_method" | "created_at" | "updated_at" |
  "shipped_at" | "delivered_at" | "shipping_address"
> & {
  tracking_events: Array<{
    status: string;
    date: string;
    description: string;
  }>;
};

// Return type
type TrackOrderResult =
  | { success: true; order: OrderTrackingInfo }
  | { success: false; error: string };

export async function trackOrder(data: TrackOrderData): Promise<TrackOrderResult> {
  try {
    // 1. Validate input
    const { orderNumber } = trackOrderSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get order by order number
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        user_id,
        status,
        payment_status,
        total_amount,
        tracking_number,
        shipping_method,
        shipping_address,
        created_at,
        updated_at,
        shipped_at,
        delivered_at
      `)
      .eq("order_number", orderNumber.toUpperCase())
      .single();

    if (orderError) {
      if (orderError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy đơn hàng với số đơn hàng này",
        };
      }
      return {
        success: false,
        error: orderError.message || "Không thể tra cứu đơn hàng",
      };
    }

    if (!order) {
      return {
        success: false,
        error: "Không tìm thấy đơn hàng với số đơn hàng này",
      };
    }

    // 4. Optional: Authorization check for logged-in users
    // Allow both logged-in users (for their own orders) and anonymous users (public tracking)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is logged in, check if they own this order or are admin
    if (user && order.user_id !== user.id) {
      // Check if current user is admin
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !userRole || userRole.role !== "admin") {
        return {
          success: false,
          error: "Bạn không có quyền tra cứu đơn hàng này",
        };
      }
    }

    // 5. Generate tracking events based on order status and dates
    const trackingEvents: Array<{
      status: string;
      date: string;
      description: string;
    }> = [];

    // Add order creation event
    trackingEvents.push({
      status: "pending",
      date: order.created_at,
      description: "Đơn hàng đã được tạo và đang chờ xử lý",
    });

    // Add events based on current status
    if (["confirmed", "processing", "shipped", "delivered"].includes(order.status)) {
      trackingEvents.push({
        status: "confirmed",
        date: order.updated_at, // You might want to track this separately
        description: "Đơn hàng đã được xác nhận",
      });
    }

    if (["processing", "shipped", "delivered"].includes(order.status)) {
      trackingEvents.push({
        status: "processing",
        date: order.updated_at,
        description: "Đơn hàng đang được chuẩn bị",
      });
    }

    if (["shipped", "delivered"].includes(order.status)) {
      trackingEvents.push({
        status: "shipped",
        date: order.shipped_at || order.updated_at,
        description: order.tracking_number 
          ? `Đơn hàng đã được giao cho đơn vị vận chuyển. Mã vận đơn: ${order.tracking_number}`
          : "Đơn hàng đã được giao cho đơn vị vận chuyển",
      });
    }

    if (order.status === "delivered" && order.delivered_at) {
      trackingEvents.push({
        status: "delivered",
        date: order.delivered_at,
        description: "Đơn hàng đã được giao thành công",
      });
    }

    if (order.status === "cancelled") {
      trackingEvents.push({
        status: "cancelled",
        date: order.updated_at,
        description: "Đơn hàng đã bị hủy",
      });
    }

    if (order.status === "refunded") {
      trackingEvents.push({
        status: "refunded",
        date: order.updated_at,
        description: "Đơn hàng đã được hoàn tiền",
      });
    }

    // Sort events by date
    trackingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 6. Prepare tracking info
    const orderTrackingInfo: OrderTrackingInfo = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      total_amount: order.total_amount,
      tracking_number: order.tracking_number,
      shipping_method: order.shipping_method,
      shipping_address: order.shipping_address,
      created_at: order.created_at,
      updated_at: order.updated_at,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      tracking_events: trackingEvents,
    };

    return {
      success: true,
      order: orderTrackingInfo,
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
      error: "Đã xảy ra lỗi không mong muốn khi tra cứu đơn hàng",
    };
  }
} 