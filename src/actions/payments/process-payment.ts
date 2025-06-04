"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment, PaymentUpdateDto } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const processPaymentSchema = z.object({
  paymentId: z.number().positive("ID thanh toán không hợp lệ"),
  status: z.enum(["processing", "completed", "failed", "cancelled"], {
    required_error: "Trạng thái thanh toán là bắt buộc",
  }),
  transactionId: z.string().optional(),
  gatewayResponse: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  failureReason: z.string().optional(),
});

type ProcessPaymentData = z.infer<typeof processPaymentSchema>;

// Return type
type ProcessPaymentResult =
  | { 
      success: true; 
      message: string; 
      payment: Payment;
    }
  | { success: false; error: string };

export async function processPayment(data: ProcessPaymentData): Promise<ProcessPaymentResult> {
  try {
    // 1. Validate input
    const { paymentId, status, transactionId, gatewayResponse, failureReason } = processPaymentSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xử lý thanh toán",
      };
    }

    // 4. Get payment details
    const { data: payment, error: paymentError } = await supabase
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

    if (!payment) {
      return {
        success: false,
        error: "Không tìm thấy giao dịch thanh toán",
      };
    }

    // 5. Check authorization
    const order = payment.orders;
    let hasPermission = order.user_id === user.id;

    // Check if user is admin for status changes other than cancellation
    if (!hasPermission || (status !== "cancelled" && hasPermission)) {
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleError && userRole && userRole.role === "admin") {
        hasPermission = true;
      } else if (status !== "cancelled") {
        // Only admin can process payments (except cancellation by owner)
        return {
          success: false,
          error: "Bạn không có quyền xử lý giao dịch thanh toán này",
        };
      }
    }

    if (!hasPermission) {
      return {
        success: false,
        error: "Bạn không có quyền xử lý giao dịch thanh toán này",
      };
    }

    // 6. Validate payment status transition
    const isValidTransition = validateStatusTransition(payment.status, status);
    if (!isValidTransition) {
      return {
        success: false,
        error: `Không thể chuyển trạng thái từ "${payment.status}" sang "${status}"`,
      };
    }

    // 7. Validate failure reason for failed status
    if (status === "failed" && !failureReason) {
      return {
        success: false,
        error: "Lý do thất bại là bắt buộc khi chuyển trạng thái sang 'failed'",
      };
    }

    // 8. Prepare update data
    const updateData: PaymentUpdateDto = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set transaction ID if provided
    if (transactionId) {
      updateData.transaction_id = transactionId;
    }

    // Set processed_at for completed payments
    if (status === "completed") {
      updateData.processed_at = new Date().toISOString();
    }

    // Merge gateway response with existing response
    if (gatewayResponse) {
      const existingResponse = (payment.gateway_response as Record<string, string | number | boolean | null>) || {};
      updateData.gateway_response = {
        ...existingResponse,
        ...gatewayResponse,
        last_updated: new Date().toISOString(),
        updated_by: user.id,
      };

      // Add failure reason to gateway response if failed
      if (status === "failed" && failureReason) {
        (updateData.gateway_response as Record<string, string | number | boolean | null>).failure_reason = failureReason;
      }
    } else if (status === "failed" && failureReason) {
      // Add failure reason even without gateway response
      updateData.gateway_response = {
        failure_reason: failureReason,
        updated_by: user.id,
        last_updated: new Date().toISOString(),
      };
    }

    // 9. Update payment
    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", paymentId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật trạng thái thanh toán",
      };
    }

    if (!updatedPayment) {
      return {
        success: false,
        error: "Không thể cập nhật trạng thái thanh toán",
      };
    }

    // 10. Update order status based on payment status
    await updateOrderBasedOnPaymentStatus(supabase, order, status);

    // 11. Handle post-processing tasks
    await handlePostProcessingTasks(supabase, updatedPayment, order, status);

    return {
      success: true,
      message: getStatusMessage(status, updatedPayment.transaction_id || updatedPayment.id.toString()),
      payment: updatedPayment,
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
      error: "Đã xảy ra lỗi không mong muốn khi xử lý thanh toán",
    };
  }
}

/**
 * Validate payment status transition
 */
function validateStatusTransition(currentStatus: string, newStatus: string): boolean {
  const transitions: Record<string, string[]> = {
    "pending": ["processing", "cancelled", "failed"],
    "processing": ["completed", "failed", "cancelled"],
    "completed": ["refunded"], // Only refunds allowed after completion
    "failed": ["processing"], // Can retry failed payments
    "cancelled": [], // Cannot change cancelled payments
    "refunded": [], // Cannot change refunded payments
  };

  return transitions[currentStatus]?.includes(newStatus) || false;
}

/**
 * Update order status based on payment status
 */
async function updateOrderBasedOnPaymentStatus(
  supabase: ReturnType<typeof createClient>,
  order: { id: number; status: string; payment_status: string },
  paymentStatus: string
): Promise<void> {
  const orderUpdates: { status?: string; payment_status?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };

  switch (paymentStatus) {
    case "processing":
      orderUpdates.payment_status = "processing";
      break;
    case "completed":
      orderUpdates.payment_status = "paid";
      // If order is still pending, move to confirmed
      if (order.status === "pending") {
        orderUpdates.status = "confirmed";
      }
      break;
    case "failed":
      orderUpdates.payment_status = "failed";
      break;
    case "cancelled":
      orderUpdates.payment_status = "cancelled";
      // If order is still pending, cancel it
      if (order.status === "pending") {
        orderUpdates.status = "cancelled";
      }
      break;
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update(orderUpdates)
    .eq("id", order.id);

  if (orderUpdateError) {
    console.error("Error updating order status:", orderUpdateError);
  }
}

/**
 * Handle post-processing tasks after payment status change
 */
async function handlePostProcessingTasks(
  supabase: ReturnType<typeof createClient>,
  payment: Payment,
  order: { id: number; status: string },
  status: string
): Promise<void> {
  switch (status) {
    case "completed":
      // Send payment confirmation email/notification
      await sendPaymentConfirmation(payment, order);
      break;
    case "failed":
      // Send payment failure notification
      await sendPaymentFailureNotification(payment, order);
      break;
    case "cancelled":
      // Restore product stock if order is cancelled
      if (order.status === "cancelled") {
        await restoreProductStock(supabase, order.id);
      }
      break;
  }
}

/**
 * Send payment confirmation (mock implementation)
 */
async function sendPaymentConfirmation(
  payment: Payment,
  order: { id: number }
): Promise<void> {
  // Mock implementation - replace with actual email/notification service
  console.log(`Payment confirmation sent for payment ${payment.id}, order ${order.id}`);
}

/**
 * Send payment failure notification (mock implementation)
 */
async function sendPaymentFailureNotification(
  payment: Payment,
  order: { id: number }
): Promise<void> {
  // Mock implementation - replace with actual email/notification service
  console.log(`Payment failure notification sent for payment ${payment.id}, order ${order.id}`);
}

/**
 * Restore product stock when order is cancelled
 */
async function restoreProductStock(
  supabase: ReturnType<typeof createClient>,
  orderId: number
): Promise<void> {
  try {
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (itemsError || !orderItems) {
      console.error("Error getting order items for stock restoration:", itemsError);
      return;
    }

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
  } catch (error) {
    console.error("Error restoring product stock:", error);
  }
}

/**
 * Get status message for payment processing
 */
function getStatusMessage(status: string, transactionId: string): string {
  switch (status) {
    case "processing":
      return `Giao dịch ${transactionId} đang được xử lý`;
    case "completed":
      return `Giao dịch ${transactionId} đã hoàn thành thành công`;
    case "failed":
      return `Giao dịch ${transactionId} đã thất bại`;
    case "cancelled":
      return `Giao dịch ${transactionId} đã bị hủy`;
    default:
      return `Trạng thái giao dịch ${transactionId} đã được cập nhật`;
  }
} 