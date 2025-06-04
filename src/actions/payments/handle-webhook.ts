"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const handleWebhookSchema = z.object({
  provider: z.enum(["vnpay", "momo", "bank_transfer"], {
    required_error: "Nhà cung cấp thanh toán là bắt buộc",
  }),
  payload: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  signature: z.string().optional(), // For webhook authentication
  timestamp: z.string().optional(),
});

type HandleWebhookData = z.infer<typeof handleWebhookSchema>;

// Webhook processing result
type WebhookProcessingResult = {
  success: boolean;
  transactionId?: string;
  status?: string;
  amount?: number;
  errorMessage?: string;
  action: "payment_completed" | "payment_failed" | "payment_cancelled" | "payment_pending" | "no_action";
};

// Return type
type HandleWebhookResult =
  | { 
      success: true; 
      message: string; 
      result: WebhookProcessingResult;
      payment?: Payment;
    }
  | { success: false; error: string };

export async function handlePaymentWebhook(data: HandleWebhookData): Promise<HandleWebhookResult> {
  try {
    // 1. Validate input
    const { provider, payload, signature } = handleWebhookSchema.parse(data);

    // 2. Create Supabase client (admin client for webhook processing)
    const supabase = createClient();

    // 3. Authenticate webhook (verify signature)
    const isValidWebhook = await verifyWebhookSignature(provider, payload, signature);
    
    if (!isValidWebhook) {
      return {
        success: false,
        error: "Webhook signature không hợp lệ",
      };
    }

    // 4. Process webhook payload based on provider
    const processingResult = await processWebhookPayload(provider, payload);

    if (!processingResult.success || !processingResult.transactionId) {
      return {
        success: false,
        error: processingResult.errorMessage || "Không thể xử lý webhook payload",
      };
    }

    // 5. Find payment by transaction ID
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select(`
        *,
        orders!inner (
          id,
          user_id,
          order_number,
          status,
          payment_status
        )
      `)
      .eq("transaction_id", processingResult.transactionId)
      .eq("payment_provider", provider)
      .single();

    if (paymentError) {
      if (paymentError.code === "PGRST116") {
        // Payment not found - might be a duplicate webhook or invalid transaction
        return {
          success: true,
          message: "Giao dịch không tồn tại hoặc đã được xử lý",
          result: { ...processingResult, action: "no_action" },
        };
      }
      return {
        success: false,
        error: paymentError.message || "Không thể lấy thông tin thanh toán",
      };
    }

    if (!payment) {
      return {
        success: true,
        message: "Giao dịch không tồn tại",
        result: { ...processingResult, action: "no_action" },
      };
    }

    // 6. Check if payment status has already been updated
    if (payment.status === processingResult.status) {
      return {
        success: true,
        message: "Giao dịch đã được cập nhật trước đó",
        result: { ...processingResult, action: "no_action" },
        payment,
      };
    }

    // 7. Update payment status based on webhook result
    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update({
        status: processingResult.status,
        gateway_response: payload,
        processed_at: processingResult.status === "completed" ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id)
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

    // 8. Update order status based on payment status
    const order = payment.orders;
    if (processingResult.status === "completed") {
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: order.status === "pending" ? "confirmed" : order.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (orderUpdateError) {
        console.error("Error updating order after payment:", orderUpdateError);
      }
    } else if (processingResult.status === "failed") {
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (orderUpdateError) {
        console.error("Error updating order after payment failure:", orderUpdateError);
      }
    }

    // 9. Determine action taken
    let action: WebhookProcessingResult["action"] = "no_action";
    switch (processingResult.status) {
      case "completed":
        action = "payment_completed";
        break;
      case "failed":
        action = "payment_failed";
        break;
      case "cancelled":
        action = "payment_cancelled";
        break;
      case "pending":
      case "processing":
        action = "payment_pending";
        break;
    }

    return {
      success: true,
      message: `Đã xử lý webhook cho giao dịch ${processingResult.transactionId}`,
      result: { ...processingResult, action },
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
      error: "Đã xảy ra lỗi không mong muốn khi xử lý webhook",
    };
  }
}

/**
 * Verify webhook signature for security
 */
async function verifyWebhookSignature(
  provider: string,
  payload: Record<string, string | number | boolean | null>,
  signature?: string
): Promise<boolean> {
  // Mock signature verification - replace with actual signature verification logic
  switch (provider) {
    case "vnpay":
      return verifyVnpaySignature(payload, signature);
    case "momo":
      return verifyMomoSignature(payload, signature);
    case "bank_transfer":
      return true; // Bank transfers might not have webhook signatures
    default:
      return false;
  }
}

/**
 * Process webhook payload based on provider
 */
async function processWebhookPayload(
  provider: string,
  payload: Record<string, string | number | boolean | null>
): Promise<WebhookProcessingResult> {
  try {
    switch (provider) {
      case "vnpay":
        return processVnpayWebhook(payload);
      case "momo":
        return processMomoWebhook(payload);
      case "bank_transfer":
        return processBankTransferWebhook(payload);
      default:
        return {
          success: false,
          errorMessage: "Nhà cung cấp không được hỗ trợ",
          action: "no_action",
        };
    }
  } catch {
    return {
      success: false,
      errorMessage: "Lỗi khi xử lý webhook payload",
      action: "no_action",
    };
  }
}

// Mock verification functions - replace with actual implementation
function verifyVnpaySignature(
  payload: Record<string, string | number | boolean | null>,
  signature?: string
): boolean {
  // Mock VNPay signature verification
  // In real implementation, verify HMAC signature with VNPay secret key
  return Boolean(signature && signature.length > 0);
}

function verifyMomoSignature(
  payload: Record<string, string | number | boolean | null>,
  signature?: string
): boolean {
  // Mock MoMo signature verification
  // In real implementation, verify signature with MoMo secret key
  return Boolean(signature && signature.length > 0);
}

// Mock webhook processing functions - replace with actual implementation
function processVnpayWebhook(
  payload: Record<string, string | number | boolean | null>
): WebhookProcessingResult {
  const responseCode = payload.vnp_ResponseCode as string;
  const transactionId = payload.vnp_TxnRef as string;
  const amount = payload.vnp_Amount as number;

  if (responseCode === "00") {
    return {
      success: true,
      transactionId,
      status: "completed",
      amount: amount / 100, // VNPay amount is in cents
      action: "payment_completed",
    };
  } else {
    return {
      success: true,
      transactionId,
      status: "failed",
      amount: amount / 100,
      errorMessage: `VNPay error code: ${responseCode}`,
      action: "payment_failed",
    };
  }
}

function processMomoWebhook(
  payload: Record<string, string | number | boolean | null>
): WebhookProcessingResult {
  const resultCode = payload.resultCode as number;
  const transactionId = payload.orderId as string;
  const amount = payload.amount as number;

  if (resultCode === 0) {
    return {
      success: true,
      transactionId,
      status: "completed",
      amount,
      action: "payment_completed",
    };
  } else {
    return {
      success: true,
      transactionId,
      status: "failed",
      amount,
      errorMessage: `MoMo error code: ${resultCode}`,
      action: "payment_failed",
    };
  }
}

function processBankTransferWebhook(
  payload: Record<string, string | number | boolean | null>
): WebhookProcessingResult {
  const transactionId = payload.reference as string;
  const amount = payload.amount as number;
  const status = payload.status as string;

  return {
    success: true,
    transactionId,
    status: status === "completed" ? "completed" : "failed",
    amount,
    action: status === "completed" ? "payment_completed" : "payment_failed",
  };
} 