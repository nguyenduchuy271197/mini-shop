"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment, Order, Profile } from "@/types/custom.types";
import { z } from "zod";

// Define type for payment with order and customer data
type PaymentWithDetails = Payment & {
  order: Pick<Order, "id" | "order_number" | "user_id" | "total_amount"> & {
    customer: Pick<Profile, "id" | "full_name" | "email"> | null;
  } | null;
};

// Validation schema for export filters
const exportPaymentsFiltersSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).optional(),
  paymentMethod: z.enum(['vnpay', 'cod', 'stripe']).optional(),
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
  search: z.string().optional(), // Search in order number, transaction ID, customer email
}).optional();

const exportPaymentsSchema = z.object({
  filters: exportPaymentsFiltersSchema,
  format: z.enum(['csv']).default('csv'),
});

type ExportPaymentsData = z.infer<typeof exportPaymentsSchema>;

// Return type
type ExportPaymentsResult =
  | {
      success: true;
      data: PaymentWithDetails[];
      totalCount: number;
    }
  | { success: false; error: string };

export async function exportPayments(data: ExportPaymentsData): Promise<ExportPaymentsResult> {
  try {
    // 1. Validate input
    const { filters } = exportPaymentsSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xuất danh sách thanh toán",
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
        error: "Bạn không có quyền xuất danh sách thanh toán",
      };
    }

    // 4. Build payments query
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

      // Search functionality
      if (filters.search) {
        const searchTerm = filters.search.trim();
        if (searchTerm) {
          // First get order IDs that match the search term
          const { data: matchingOrders } = await supabase
            .from("orders")
            .select("id, order_number")
            .or(`order_number.ilike.%${searchTerm}%`);

          const orderIds = matchingOrders?.map(o => o.id) || [];
          
          // Then filter payments by transaction_id or matching order_ids
          if (orderIds.length > 0) {
            paymentsQuery = paymentsQuery.or(
              `transaction_id.ilike.%${searchTerm}%,stripe_session_id.ilike.%${searchTerm}%,stripe_payment_intent_id.ilike.%${searchTerm}%,order_id.in.(${orderIds.join(',')})`
            );
          } else {
            paymentsQuery = paymentsQuery.or(
              `transaction_id.ilike.%${searchTerm}%,stripe_session_id.ilike.%${searchTerm}%,stripe_payment_intent_id.ilike.%${searchTerm}%`
            );
          }
        }
      }
    }

    // 6. Get all payments (no pagination for export)
    const { data: payments, error: paymentsError } = await paymentsQuery
      .order("created_at", { ascending: false })
      .limit(10000); // Reasonable limit for export

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

    // 7. Get order and customer information
    let typedPayments: PaymentWithDetails[] = payments.map(payment => ({
      ...payment,
      order: null,
    }));

    if (payments.length > 0) {
      const orderIds = payments.map(p => p.order_id);
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, user_id, total_amount")
        .in("id", orderIds);

      const orderMap = new Map(orders?.map(o => [o.id, o]) || []);

      // Get customer profiles
      if (orders) {
        const userIds = orders.map(o => o.user_id).filter(Boolean) as string[];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Combine data
        typedPayments = payments.map(payment => {
          const order = orderMap.get(payment.order_id);
          return {
            ...payment,
            order: order ? {
              ...order,
              customer: order.user_id ? profileMap.get(order.user_id) || null : null,
            } : null,
          };
        });
      }
    }

    return {
      success: true,
      data: typedPayments,
      totalCount: payments.length,
    };
  } catch (error) {
    console.error("Error exporting payments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Có lỗi xảy ra khi xuất danh sách thanh toán",
    };
  }
} 