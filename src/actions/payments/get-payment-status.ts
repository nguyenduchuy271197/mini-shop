"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const getPaymentStatusSchema = z.object({
  paymentId: z.number().positive("ID thanh toán không hợp lệ"),
  includeOrderInfo: z.boolean().optional().default(false),
});

type GetPaymentStatusData = z.infer<typeof getPaymentStatusSchema>;

// Payment status info
type PaymentStatusInfo = {
  id: number;
  transaction_id: string | null;
  status: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_provider: string | null;
  created_at: string;
  processed_at: string | null;
  gateway_response?: Record<string, string | number | boolean | null> | null;
  order_info?: {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: number;
  };
};

// Return type
type GetPaymentStatusResult =
  | { 
      success: true; 
      payment: PaymentStatusInfo;
    }
  | { success: false; error: string };

export async function getPaymentStatus(data: GetPaymentStatusData): Promise<GetPaymentStatusResult> {
  try {
    // 1. Validate input
    const { paymentId, includeOrderInfo } = getPaymentStatusSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xem trạng thái thanh toán",
      };
    }

    // 4. Build query based on whether to include order info
    const query = supabase
      .from("payments")
      .select(includeOrderInfo 
        ? `
          id,
          transaction_id,
          status,
          amount,
          currency,
          payment_method,
          payment_provider,
          created_at,
          processed_at,
          gateway_response,
          orders!inner (
            id,
            order_number,
            status,
            payment_status,
            total_amount,
            user_id
          )
        `
        : `
          id,
          transaction_id,
          status,
          amount,
          currency,
          payment_method,
          payment_provider,
          created_at,
          processed_at,
          gateway_response,
          orders!inner (
            user_id
          )
        `
      )
      .eq("id", paymentId);

    const { data: payment, error: paymentError } = await query.single();

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
        error: "Bạn không có quyền xem thông tin thanh toán này",
      };
    }

    // 6. Prepare payment status info
    const paymentStatusInfo: PaymentStatusInfo = {
      id: payment.id,
      transaction_id: payment.transaction_id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      payment_method: payment.payment_method,
      payment_provider: payment.payment_provider,
      created_at: payment.created_at,
      processed_at: payment.processed_at,
    };

    // Include gateway response for admins only
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole && userRole.role === "admin") {
      paymentStatusInfo.gateway_response = payment.gateway_response as Record<string, string | number | boolean | null> | null;
    }

    // Include order info if requested
    if (includeOrderInfo && order && 'order_number' in order) {
      paymentStatusInfo.order_info = {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        total_amount: order.total_amount,
      };
    }

    return {
      success: true,
      payment: paymentStatusInfo,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy trạng thái thanh toán",
    };
  }
} 