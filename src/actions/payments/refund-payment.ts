"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment, PaymentInsertDto } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const refundPaymentSchema = z.object({
  paymentId: z.number().positive("ID thanh toán không hợp lệ"),
  amount: z.number().positive("Số tiền hoàn trả phải lớn hơn 0"),
  reason: z.string().min(1, "Lý do hoàn tiền không được để trống").max(500, "Lý do hoàn tiền quá dài"),
  refundMethod: z.enum(["original_payment", "bank_transfer", "cash"], {
    required_error: "Phương thức hoàn tiền là bắt buộc",
  }).optional().default("original_payment"),
});

type RefundPaymentData = z.infer<typeof refundPaymentSchema>;

// Refund info type
type RefundInfo = {
  refund_payment_id: number;
  original_payment_id: number;
  order_id: number;
  order_number: string;
  refund_amount: number;
  original_amount: number;
  reason: string;
  refund_method: string;
  transaction_id: string;
  processed_at: string;
};

// Return type
type RefundPaymentResult =
  | { 
      success: true; 
      message: string; 
      refund: RefundInfo;
      original_payment: Payment;
    }
  | { success: false; error: string };

export async function refundPayment(data: RefundPaymentData): Promise<RefundPaymentResult> {
  try {
    // 1. Validate input
    const { paymentId, amount, reason, refundMethod } = refundPaymentSchema.parse(data);

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

    // 5. Get original payment details
    const { data: originalPayment, error: paymentError } = await supabase
      .from("payments")
      .select(`
        *,
        orders!inner (
          id,
          order_number,
          user_id,
          total_amount,
          status,
          payment_status
        )
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError) {
      if (paymentError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy giao dịch thanh toán",
        };
      }
      return {
        success: false,
        error: paymentError.message || "Không thể lấy thông tin thanh toán",
      };
    }

    if (!originalPayment) {
      return {
        success: false,
        error: "Không tìm thấy giao dịch thanh toán",
      };
    }

    // 6. Validate refund conditions
    if (originalPayment.status !== "completed") {
      return {
        success: false,
        error: "Chỉ có thể hoàn tiền cho giao dịch đã hoàn thành",
      };
    }

    if (amount > originalPayment.amount) {
      return {
        success: false,
        error: "Số tiền hoàn trả không được vượt quá số tiền giao dịch gốc",
      };
    }

    const order = originalPayment.orders;

    // 7. Check existing refunds for this payment
    const { data: existingRefunds, error: refundsError } = await supabase
      .from("payments")
      .select("amount, status")
      .eq("order_id", order.id)
      .like("transaction_id", "REFUND-%")
      .eq("status", "completed");

    if (refundsError) {
      console.error("Error checking existing refunds:", refundsError);
    }

    const totalRefunded = existingRefunds?.reduce((sum, refund) => sum + refund.amount, 0) || 0;

    if (totalRefunded + amount > originalPayment.amount) {
      return {
        success: false,
        error: `Tổng số tiền hoàn trả không được vượt quá ${originalPayment.amount.toLocaleString('vi-VN')}₫. Đã hoàn: ${totalRefunded.toLocaleString('vi-VN')}₫`,
      };
    }

    // 8. Generate refund transaction ID
    const refundTransactionId = `REFUND-${originalPayment.transaction_id || originalPayment.id}-${Date.now().toString().slice(-6)}`;

    // 9. Create refund payment record
    const refundPaymentData: PaymentInsertDto = {
      order_id: order.id,
      payment_method: originalPayment.payment_method,
      payment_provider: originalPayment.payment_provider,
      transaction_id: refundTransactionId,
      amount: amount,
      currency: originalPayment.currency,
      status: "completed", // Assume refund is processed immediately
      processed_at: new Date().toISOString(),
      gateway_response: {
        refund_reason: reason,
        refund_method: refundMethod,
        original_payment_id: originalPayment.id,
        original_transaction_id: originalPayment.transaction_id,
      },
    };

    const { data: refundPayment, error: refundError } = await supabase
      .from("payments")
      .insert(refundPaymentData)
      .select()
      .single();

    if (refundError) {
      return {
        success: false,
        error: refundError.message || "Không thể tạo giao dịch hoàn tiền",
      };
    }

    if (!refundPayment) {
      return {
        success: false,
        error: "Không thể tạo giao dịch hoàn tiền",
      };
    }

    // 10. Update original payment status if fully refunded
    const isFullRefund = (totalRefunded + amount) >= originalPayment.amount;
    
    if (isFullRefund) {
      const { error: updateOriginalError } = await supabase
        .from("payments")
        .update({
          status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", originalPayment.id);

      if (updateOriginalError) {
        console.error("Error updating original payment status:", updateOriginalError);
      }

      // Update order status to refunded
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({
          status: "refunded",
          payment_status: "refunded",
          admin_notes: `Hoàn tiền toàn bộ: ${amount.toLocaleString('vi-VN')}₫ - ${reason}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateOrderError) {
        console.error("Error updating order status:", updateOrderError);
      }

      // Restore product stock for fully refunded orders
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", order.id);

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
    } else {
      // Partial refund - update order admin notes
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({
          admin_notes: `Hoàn tiền một phần: ${amount.toLocaleString('vi-VN')}₫ - ${reason}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateOrderError) {
        console.error("Error updating order notes:", updateOrderError);
      }
    }

    // 11. Prepare refund info
    const refundInfo: RefundInfo = {
      refund_payment_id: refundPayment.id,
      original_payment_id: originalPayment.id,
      order_id: order.id,
      order_number: order.order_number,
      refund_amount: amount,
      original_amount: originalPayment.amount,
      reason,
      refund_method: refundMethod,
      transaction_id: refundTransactionId,
      processed_at: refundPayment.processed_at || new Date().toISOString(),
    };

    return {
      success: true,
      message: isFullRefund 
        ? `Đã hoàn tiền toàn bộ ${amount.toLocaleString('vi-VN')}₫ cho giao dịch ${originalPayment.transaction_id || originalPayment.id}`
        : `Đã hoàn tiền một phần ${amount.toLocaleString('vi-VN')}₫ cho giao dịch ${originalPayment.transaction_id || originalPayment.id}`,
      refund: refundInfo,
      original_payment: originalPayment,
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