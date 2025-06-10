"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment, PaymentInsertDto, Order } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const createPaymentSchema = z.object({
  orderId: z.number().positive("ID đơn hàng không hợp lệ"),
  paymentMethod: z.enum(["vnpay", "cod", "stripe"], {
    required_error: "Phương thức thanh toán là bắt buộc",
    invalid_type_error: "Phương thức thanh toán không hợp lệ",
  }),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  currency: z.string().optional().default("VND"),
  paymentProvider: z.string().optional(),
  transactionId: z.string().optional(),
});

type CreatePaymentData = z.infer<typeof createPaymentSchema>;

// Return type
type CreatePaymentResult =
  | { 
      success: true; 
      message: string; 
      payment: Payment;
      payment_url?: string; // For online payment methods
      payment_instructions?: string; // For bank transfer or COD
    }
  | { success: false; error: string };

export async function createPayment(data: CreatePaymentData): Promise<CreatePaymentResult> {
  try {
    // 1. Validate input
    const { orderId, paymentMethod, amount, currency, paymentProvider, transactionId } = createPaymentSchema.parse(data);

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
        error: "Bạn cần đăng nhập để tạo thanh toán",
      };
    }

    // 4. Get order details and verify ownership
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          products (
            name,
            stock_quantity
          )
        )
      `)
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

    // 5. Check if user owns the order
    if (order.user_id !== user.id) {
      return {
        success: false,
        error: "Bạn không có quyền tạo thanh toán cho đơn hàng này",
      };
    }

    // 6. Validate order status
    if (order.status !== "pending" && order.status !== "confirmed") {
      return {
        success: false,
        error: "Chỉ có thể tạo thanh toán cho đơn hàng đang chờ xử lý",
      };
    }

    if (order.payment_status === "paid") {
      return {
        success: false,
        error: "Đơn hàng này đã được thanh toán",
      };
    }

    // 7. Validate payment amount
    if (amount !== order.total_amount) {
      return {
        success: false,
        error: `Số tiền thanh toán (${amount.toLocaleString('vi-VN')}₫) không khớp với tổng đơn hàng (${order.total_amount.toLocaleString('vi-VN')}₫)`,
      };
    }

    // 8. Check for existing pending payments
    const { data: existingPayments, error: paymentsError } = await supabase
      .from("payments")
      .select("id, status, transaction_id")
      .eq("order_id", orderId)
      .in("status", ["pending", "processing"]);

    if (paymentsError) {
      console.error("Error checking existing payments:", paymentsError);
    }

    if (existingPayments && existingPayments.length > 0) {
      const pendingPayment = existingPayments[0];
      return {
        success: false,
        error: `Đã có giao dịch thanh toán đang chờ xử lý (${pendingPayment.transaction_id || pendingPayment.id}). Vui lòng hoàn tất hoặc hủy giao dịch trước khi tạo mới.`,
      };
    }

    // 9. Generate transaction ID if not provided
    const finalTransactionId = transactionId || generateTransactionId(paymentMethod, orderId);

    // 10. Determine payment provider
    const finalPaymentProvider = paymentProvider || getDefaultProvider(paymentMethod);

    // 11. Create payment record
    const paymentData: PaymentInsertDto = {
      order_id: orderId,
      payment_method: paymentMethod,
      payment_provider: finalPaymentProvider,
      transaction_id: finalTransactionId,
      amount,
      currency,
      status: paymentMethod === "cod" ? "pending" : "pending", // COD starts as pending until delivery
    };

    const { data: payment, error: paymentCreateError } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (paymentCreateError) {
      return {
        success: false,
        error: paymentCreateError.message || "Không thể tạo giao dịch thanh toán",
      };
    }

    if (!payment) {
      return {
        success: false,
        error: "Không thể tạo giao dịch thanh toán",
      };
    }

    // 12. Update order payment status
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (orderUpdateError) {
      console.error("Error updating order payment status:", orderUpdateError);
    }

    // 13. Generate payment URL or instructions based on payment method
    let paymentUrl: string | undefined;
    let paymentInstructions: string | undefined;

    switch (paymentMethod) {
      case "vnpay":
        paymentUrl = await generateVnpayUrl(payment, order);
        break;
      case "stripe":
        // Stripe payment URL will be handled separately in checkout flow
        paymentInstructions = "Chuyển hướng đến Stripe để thanh toán";
        break;
      case "cod":
        paymentInstructions = await generateCodInstructions(payment);
        break;
    }

    return {
      success: true,
      message: `Đã tạo giao dịch thanh toán ${finalTransactionId}`,
      payment,
      payment_url: paymentUrl,
      payment_instructions: paymentInstructions,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo thanh toán",
    };
  }
}

/**
 * Generate transaction ID for payment
 */
function generateTransactionId(paymentMethod: string, orderId: number): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  const prefix = paymentMethod.toUpperCase();
  
  return `${prefix}-${orderId}-${timestamp.slice(-8)}-${random}`;
}

/**
 * Get default payment provider for each method
 */
function getDefaultProvider(paymentMethod: string): string {
  switch (paymentMethod) {
    case "vnpay":
      return "vnpay_gateway";
    case "stripe":
      return "stripe_checkout";
    case "cod":
      return "cash_on_delivery";
    default:
      return "manual";
  }
}

/**
 * Generate VNPay payment URL
 */
async function generateVnpayUrl(payment: Payment, order: Order): Promise<string> {
  // Mock VNPay URL generation - replace with actual VNPay integration
  const baseUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const params = new URLSearchParams({
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: process.env.VNPAY_TMN_CODE || "DEMO",
    vnp_Amount: (payment.amount * 100).toString(), // VNPay uses cents
    vnp_CurrCode: "VND",
    vnp_TxnRef: payment.transaction_id || payment.id.toString(),
    vnp_OrderInfo: `Thanh toán đơn hàng ${order.order_number}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/return`,
    vnp_IpAddr: "127.0.0.1",
    vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, "").split('.')[0],
  });

  return `${baseUrl}?${params.toString()}`;
}



/**
 * Generate COD instructions
 */
async function generateCodInstructions(payment: Payment): Promise<string> {
  return `
Thanh toán khi nhận hàng (COD):
- Số tiền cần thanh toán: ${payment.amount.toLocaleString('vi-VN')}₫
- Phí COD: ${calculateCodFee(payment.amount).toLocaleString('vi-VN')}₫
- Tổng cộng: ${(payment.amount + calculateCodFee(payment.amount)).toLocaleString('vi-VN')}₫

Lưu ý: Vui lòng chuẩn bị đủ tiền mặt khi nhận hàng.
  `.trim();
}

/**
 * Calculate COD fee
 */
function calculateCodFee(amount: number): number {
  const percentage = 0.01; // 1%
  const fixedFee = 15000; // 15,000 VND
  return Math.max(amount * percentage, fixedFee);
} 