"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const verifyPaymentSchema = z.object({
  transactionId: z.string().min(1, "Mã giao dịch không được để trống"),
  provider: z.enum(["vnpay", "momo", "bank_transfer"], {
    required_error: "Nhà cung cấp thanh toán là bắt buộc",
  }),
  verificationData: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

type VerifyPaymentData = z.infer<typeof verifyPaymentSchema>;

// Payment verification result
type PaymentVerificationResult = {
  verified: boolean;
  status: "completed" | "failed" | "pending";
  amount?: number;
  transactionDate?: string;
  providerResponse?: Record<string, string | number | boolean>;
  errorMessage?: string;
};

// Return type
type VerifyPaymentResult =
  | { 
      success: true; 
      message: string; 
      verification: PaymentVerificationResult;
      payment?: Payment;
    }
  | { success: false; error: string };

export async function verifyPayment(data: VerifyPaymentData): Promise<VerifyPaymentResult> {
  try {
    // 1. Validate input
    const { transactionId, provider, verificationData } = verifyPaymentSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xác minh thanh toán",
      };
    }

    // 4. Find payment by transaction ID
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
      .eq("transaction_id", transactionId)
      .eq("payment_provider", getProviderName(provider))
      .single();

    if (paymentError) {
      if (paymentError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy giao dịch thanh toán với mã này",
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

    if (!hasPermission) {
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!roleError && userRole && userRole.role === "admin") {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return {
        success: false,
        error: "Bạn không có quyền xác minh giao dịch thanh toán này",
      };
    }

    // 6. Verify payment with provider
    const verificationResult = await verifyWithProvider(provider, transactionId, verificationData);

    if (!verificationResult.verified) {
      return {
        success: false,
        error: verificationResult.errorMessage || "Không thể xác minh giao dịch với nhà cung cấp",
      };
    }

    // 7. Check if payment status needs to be updated
    let updatedPayment = payment;
    
    if (payment.status !== verificationResult.status && verificationResult.status !== "pending") {
      const { data: updated, error: updateError } = await supabase
        .from("payments")
        .update({
          status: verificationResult.status,
          processed_at: verificationResult.status === "completed" ? new Date().toISOString() : undefined,
          gateway_response: {
            ...(payment.gateway_response as Record<string, string | number | boolean | null> || {}),
            verification_result: verificationResult.providerResponse,
            verified_at: new Date().toISOString(),
            verified_by: user.id,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating payment after verification:", updateError);
      } else if (updated) {
        updatedPayment = { ...updated, orders: order };

        // Update order status if payment is completed
        if (verificationResult.status === "completed") {
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: order.status === "pending" ? "confirmed" : order.status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);
        } else if (verificationResult.status === "failed") {
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);
        }
      }
    }

    // 8. Prepare verification result
    const finalVerification: PaymentVerificationResult = {
      verified: true,
      status: verificationResult.status,
      amount: verificationResult.amount || payment.amount,
      transactionDate: verificationResult.transactionDate || payment.created_at,
      providerResponse: verificationResult.providerResponse,
    };

    return {
      success: true,
      message: verificationResult.status === "completed" 
        ? `Giao dịch ${transactionId} đã được xác minh và hoàn thành thành công`
        : `Giao dịch ${transactionId} đã được xác minh với trạng thái: ${verificationResult.status}`,
      verification: finalVerification,
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
      error: "Đã xảy ra lỗi không mong muốn khi xác minh thanh toán",
    };
  }
}

/**
 * Get provider name for database query
 */
function getProviderName(provider: string): string {
  switch (provider) {
    case "vnpay":
      return "vnpay_gateway";
    case "momo":
      return "momo_wallet";
    case "bank_transfer":
      return "manual_bank_transfer";
    default:
      return provider;
  }
}

/**
 * Verify payment with external provider
 */
async function verifyWithProvider(
  provider: string,
  transactionId: string,
  verificationData?: Record<string, string | number | boolean>
): Promise<PaymentVerificationResult> {
  try {
    switch (provider) {
      case "vnpay":
        return await verifyVnpayPayment(transactionId);
      case "momo":
        return await verifyMomoPayment(transactionId);
      case "bank_transfer":
        return await verifyBankTransferPayment(transactionId, verificationData);
      default:
        return {
          verified: false,
          status: "failed",
          errorMessage: "Nhà cung cấp thanh toán không được hỗ trợ",
        };
    }
  } catch (error) {
    console.error("Error verifying payment with provider:", error);
    return {
      verified: false,
      status: "failed",
      errorMessage: "Lỗi khi xác minh với nhà cung cấp thanh toán",
    };
  }
}

/**
 * Verify VNPay payment (mock implementation)
 */
async function verifyVnpayPayment(
  transactionId: string,
): Promise<PaymentVerificationResult> {
  // Mock VNPay verification - replace with actual VNPay API call
  
  // Simulate API call to VNPay
  const mockResponse = {
    vnp_ResponseCode: "00", // Success code
    vnp_TransactionStatus: "00", // Transaction success
    vnp_Amount: 100000, // Amount in cents
    vnp_PayDate: "20231201120000",
    vnp_TxnRef: transactionId,
  };

  if (mockResponse.vnp_ResponseCode === "00" && mockResponse.vnp_TransactionStatus === "00") {
    return {
      verified: true,
      status: "completed",
      amount: mockResponse.vnp_Amount / 100,
      transactionDate: formatVnpayDate(mockResponse.vnp_PayDate),
      providerResponse: mockResponse,
    };
  } else {
    return {
      verified: true,
      status: "failed",
      providerResponse: mockResponse,
      errorMessage: `VNPay verification failed: ${mockResponse.vnp_ResponseCode}`,
    };
  }
}

/**
 * Verify MoMo payment (mock implementation)
 */
async function verifyMomoPayment(
  transactionId: string,
): Promise<PaymentVerificationResult> {
  // Mock MoMo verification - replace with actual MoMo API call
  
  const mockResponse = {
    resultCode: 0, // Success code
    amount: 100000,
    transId: "12345678",
    orderId: transactionId,
    responseTime: Date.now(),
  };

  if (mockResponse.resultCode === 0) {
    return {
      verified: true,
      status: "completed",
      amount: mockResponse.amount,
      transactionDate: new Date(mockResponse.responseTime).toISOString(),
      providerResponse: mockResponse,
    };
  } else {
    return {
      verified: true,
      status: "failed",
      providerResponse: mockResponse,
      errorMessage: `MoMo verification failed: ${mockResponse.resultCode}`,
    };
  }
}

/**
 * Verify bank transfer payment (mock implementation)
 */
async function verifyBankTransferPayment(
  transactionId: string,
  verificationData?: Record<string, string | number | boolean>
): Promise<PaymentVerificationResult> {
  // Mock bank transfer verification - replace with actual bank API or manual verification
  
  // In real implementation, this might check with bank APIs or manual confirmation
  const mockVerified = Math.random() > 0.3; // 70% success rate for demo
  
  if (mockVerified) {
    return {
      verified: true,
      status: "completed",
      amount: verificationData?.amount as number || 100000,
      transactionDate: new Date().toISOString(),
      providerResponse: {
        bank_reference: `BT-${Date.now()}`,
        verified_manually: true,
        verification_method: "manual_check",
      },
    };
  } else {
    return {
      verified: false,
      status: "pending",
      errorMessage: "Chưa thể xác minh giao dịch chuyển khoản. Vui lòng thử lại sau.",
    };
  }
}

/**
 * Format VNPay date string to ISO string
 */
function formatVnpayDate(vnpayDate: string): string {
  // VNPay date format: YYYYMMDDHHMMSS
  const year = vnpayDate.substr(0, 4);
  const month = vnpayDate.substr(4, 2);
  const day = vnpayDate.substr(6, 2);
  const hour = vnpayDate.substr(8, 2);
  const minute = vnpayDate.substr(10, 2);
  const second = vnpayDate.substr(12, 2);
  
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`).toISOString();
} 