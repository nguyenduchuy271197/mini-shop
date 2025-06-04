"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment, Order, Profile } from "@/types/custom.types";
import { z } from "zod";

// Define type for payment with order and customer data from Supabase query
type PaymentWithDetails = Payment & {
  order: Pick<Order, "id" | "order_number" | "user_id" | "total_amount"> & {
    customer: Pick<Profile, "id" | "full_name" | "email"> | null;
  } | null;
};

// Validation schema cho payment filters
const paymentFiltersSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).optional(),
  paymentMethod: z.enum(['vnpay', 'momo', 'cod', 'bank_transfer']).optional(),
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  orderId: z.number().positive().optional(),
  customerId: z.string().uuid().optional(),
  transactionId: z.string().optional(),
}).optional();

const getAllPaymentsSchema = z.object({
  pagination: z.object({
    page: z.number().int().min(1, "Trang phải lớn hơn 0"),
    limit: z.number().int().min(1, "Số lượng phải lớn hơn 0").max(100, "Số lượng tối đa 100"),
  }),
  filters: paymentFiltersSchema,
  includeOrder: z.boolean().optional().default(true),
  includeCustomer: z.boolean().optional().default(true),
});

type GetAllPaymentsData = z.infer<typeof getAllPaymentsSchema>;

// Return type
type GetAllPaymentsResult =
  | {
      success: true;
      payments: PaymentWithDetails[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      summary: {
        total_payments: number;
        total_amount: number;
        completed_amount: number;
        pending_amount: number;
        failed_amount: number;
        refunded_amount: number;
        payments_by_status: Record<string, number>;
        payments_by_method: Record<string, number>;
      };
    }
  | { success: false; error: string };

export async function getAllPayments(data: GetAllPaymentsData): Promise<GetAllPaymentsResult> {
  try {
    // 1. Validate input
    const { pagination, filters, includeOrder, includeCustomer } = getAllPaymentsSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Check admin authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để xem danh sách thanh toán",
      };
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return {
        success: false,
        error: "Bạn không có quyền xem danh sách thanh toán",
      };
    }

    // 4. Get payments with order information separately
    let paymentsQuery = supabase
      .from("payments")
      .select("*");

    // 5. Apply filters
    if (filters) {
      if (filters.status) {
        paymentsQuery = paymentsQuery.eq("status", filters.status);
      }

      if (filters.paymentMethod) {
        paymentsQuery = paymentsQuery.eq("payment_method", filters.paymentMethod);
      }

      if (filters.dateFrom) {
        paymentsQuery = paymentsQuery.gte("created_at", filters.dateFrom);
      }

      if (filters.dateTo) {
        paymentsQuery = paymentsQuery.lte("created_at", filters.dateTo);
      }

      if (filters.minAmount !== undefined) {
        paymentsQuery = paymentsQuery.gte("amount", filters.minAmount);
      }

      if (filters.maxAmount !== undefined) {
        paymentsQuery = paymentsQuery.lte("amount", filters.maxAmount);
      }

      if (filters.orderId) {
        paymentsQuery = paymentsQuery.eq("order_id", filters.orderId);
      }

      if (filters.transactionId) {
        paymentsQuery = paymentsQuery.eq("transaction_id", filters.transactionId);
      }
    }

    // 6. Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return {
        success: false,
        error: countError.message || "Không thể đếm số lượng thanh toán",
      };
    }

    if (totalCount === null) {
      return {
        success: false,
        error: "Không thể đếm số lượng thanh toán",
      };
    }

    // 7. Get payments with pagination
    const offset = (pagination.page - 1) * pagination.limit;

    const { data: payments, error: paymentsError } = await paymentsQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + pagination.limit - 1);

    if (paymentsError) {
      return {
        success: false,
        error: paymentsError.message || "Không thể lấy danh sách thanh toán",
      };
    }

    if (!payments) {
      return {
        success: false,
        error: "Không tìm thấy thanh toán",
      };
    }

    // 8. Get order and customer information if requested
    let typedPayments: PaymentWithDetails[] = payments.map(payment => ({
      ...payment,
      order: null,
    }));

    if (includeOrder && payments.length > 0) {
      const orderIds = payments.map(p => p.order_id);
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, user_id, total_amount")
        .in("id", orderIds);

      const orderMap = new Map(orders?.map(o => [o.id, o]) || []);

      if (includeCustomer && orders) {
        const userIds = orders.map(o => o.user_id).filter(Boolean) as string[];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        typedPayments = payments.map(payment => ({
          ...payment,
          order: orderMap.get(payment.order_id) ? {
            ...orderMap.get(payment.order_id)!,
            customer: orderMap.get(payment.order_id)!.user_id 
              ? profileMap.get(orderMap.get(payment.order_id)!.user_id!) || null 
              : null,
          } : null,
        }));
      } else {
        typedPayments = payments.map(payment => ({
          ...payment,
          order: orderMap.get(payment.order_id) ? {
            ...orderMap.get(payment.order_id)!,
            customer: null,
          } : null,
        }));
      }
    }

    // 9. Calculate summary statistics (for all payments, not just current page)
    const { data: allPayments, error: allPaymentsError } = await supabase
      .from("payments")
      .select("status, payment_method, amount");

    if (allPaymentsError) {
      console.error("Error fetching all payments for summary:", allPaymentsError);
    }

    const allPaymentsList = allPayments || [];
    const summary = {
      total_payments: allPaymentsList.length,
      total_amount: allPaymentsList.reduce((sum, payment) => sum + Number(payment.amount), 0),
      completed_amount: allPaymentsList
        .filter(p => p.status === 'completed')
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
      pending_amount: allPaymentsList
        .filter(p => p.status === 'pending')
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
      failed_amount: allPaymentsList
        .filter(p => p.status === 'failed')
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
      refunded_amount: allPaymentsList
        .filter(p => p.status === 'refunded')
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
      payments_by_status: allPaymentsList.reduce((acc, payment) => {
        acc[payment.status] = (acc[payment.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      payments_by_method: allPaymentsList.reduce((acc, payment) => {
        acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // 10. Calculate pagination info
    const totalPages = Math.ceil(totalCount / pagination.limit);

    return {
      success: true,
      payments: typedPayments,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: totalCount,
        totalPages,
      },
      summary,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách thanh toán",
    };
  }
} 