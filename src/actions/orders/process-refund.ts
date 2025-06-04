"use server";

import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const processRefundSchema = z.object({
  orderId: z.number().positive("ID đơn hàng không hợp lệ"),
  amount: z.number().positive("Số tiền hoàn trả phải lớn hơn 0"),
  reason: z.string().min(1, "Lý do hoàn tiền không được để trống").max(500, "Lý do hoàn tiền quá dài"),
  refundMethod: z.enum(["original_payment", "bank_transfer", "cash"], {
    required_error: "Phương thức hoàn tiền là bắt buộc",
  }).optional().default("original_payment"),
});

type ProcessRefundData = z.infer<typeof processRefundSchema>;

// Refund info type
type RefundInfo = {
  refund_id: number;
  order_id: number;
  order_number: string;
  refund_amount: number;
  original_amount: number;
  reason: string;
  refund_method: string;
  processed_at: string;
};

// Return type
type ProcessRefundResult =
  | { 
      success: true; 
      message: string; 
      refund: RefundInfo;
      order: Pick<Order, "id" | "order_number" | "status" | "updated_at">;
    }
  | { success: false; error: string };

export async function processRefund(data: ProcessRefundData): Promise<ProcessRefundResult> {
  try {
    // 1. Validate input
    const { orderId, amount, reason, refundMethod } = processRefundSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xử lý hoàn tiền",
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
        error: "Bạn không có quyền xử lý hoàn tiền",
      };
    }

    // 5. Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, status, user_id, total_amount, payment_status")
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

    // 6. Validate refund conditions
    if (order.payment_status !== "paid") {
      return {
        success: false,
        error: "Chỉ có thể hoàn tiền cho đơn hàng đã thanh toán",
      };
    }

    if (amount > order.total_amount) {
      return {
        success: false,
        error: "Số tiền hoàn trả không được vượt quá tổng giá trị đơn hàng",
      };
    }

    // 7. Check existing refunds to prevent over-refunding
    const { data: existingPayments, error: paymentsError } = await supabase
      .from("payments")
      .select("amount, status")
      .eq("order_id", orderId)
      .like("transaction_id", "REFUND-%");

    if (paymentsError) {
      console.error("Error checking existing refunds:", paymentsError);
    }

    const totalRefunded = existingPayments?.reduce((sum, payment) => 
      payment.status === "paid" ? sum + payment.amount : sum, 0) || 0;

    if (totalRefunded + amount > order.total_amount) {
      return {
        success: false,
        error: `Tổng số tiền hoàn trả không được vượt quá ${order.total_amount.toLocaleString('vi-VN')}₫. Đã hoàn: ${totalRefunded.toLocaleString('vi-VN')}₫`,
      };
    }

    // 8. Create refund payment record
    const { data: refundPayment, error: refundError } = await supabase
      .from("payments")
      .insert({
        order_id: orderId,
        amount: amount,
        payment_method: refundMethod,
        status: "paid", // Assume refund is processed immediately
        transaction_id: `REFUND-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        processed_at: new Date().toISOString(),
        currency: "VND",
        payment_provider: "manual_refund",
      })
      .select()
      .single();

    if (refundError) {
      return {
        success: false,
        error: refundError.message || "Không thể tạo bản ghi hoàn tiền",
      };
    }

    if (!refundPayment) {
      return {
        success: false,
        error: "Không thể tạo bản ghi hoàn tiền",
      };
    }

    // 9. Update order status and payment status
    const newOrderStatus = totalRefunded + amount >= order.total_amount ? "refunded" : order.status;
    const newPaymentStatus = totalRefunded + amount >= order.total_amount ? "refunded" : "paid";

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: newOrderStatus,
        payment_status: newPaymentStatus,
        admin_notes: `Hoàn tiền: ${amount.toLocaleString('vi-VN')}₫ - ${reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id, order_number, status, updated_at")
      .single();

    if (updateError) {
      // Try to rollback refund payment
      await supabase
        .from("payments")
        .delete()
        .eq("id", refundPayment.id);

      return {
        success: false,
        error: updateError.message || "Không thể cập nhật trạng thái đơn hàng",
      };
    }

    if (!updatedOrder) {
      // Try to rollback refund payment
      await supabase
        .from("payments")
        .delete()
        .eq("id", refundPayment.id);

      return {
        success: false,
        error: "Không thể cập nhật trạng thái đơn hàng",
      };
    }

    // 10. Restore product stock if needed (for cancelled/refunded orders)
    if (newOrderStatus === "refunded") {
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      if (!itemsError && orderItems) {
        for (const item of orderItems) {
          const { data: product } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();

          if (product) {
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
    }

    // 11. Prepare refund info
    const refundInfo: RefundInfo = {
      refund_id: refundPayment.id,
      order_id: orderId,
      order_number: order.order_number,
      refund_amount: amount,
      original_amount: order.total_amount,
      reason,
      refund_method: refundMethod,
      processed_at: refundPayment.processed_at || new Date().toISOString(),
    };

    return {
      success: true,
      message: `Đã xử lý hoàn tiền ${amount.toLocaleString('vi-VN')}₫ cho đơn hàng ${order.order_number}`,
      refund: refundInfo,
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
      error: "Đã xảy ra lỗi không mong muốn khi xử lý hoàn tiền",
    };
  }
} 