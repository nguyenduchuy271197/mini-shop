"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getAllPayments } from "@/actions/admin/payments/get-all-payments";
import { Payment, Order, Profile } from "@/types/custom.types";

interface PaymentFilters {
  status?: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded";
  paymentMethod?: "vnpay" | "momo" | "cod" | "bank_transfer";
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  orderId?: number;
  customerId?: string;
  transactionId?: string;
}

interface UseAdminPaymentsParams {
  pagination: {
    page: number;
    limit: number;
  };
  filters?: PaymentFilters;
  includeOrder?: boolean;
  includeCustomer?: boolean;
}

interface PaymentWithDetails extends Payment {
  order: Pick<Order, "id" | "order_number" | "user_id" | "total_amount"> & {
    customer: Pick<Profile, "id" | "full_name" | "email"> | null;
  } | null;
}

interface AdminPaymentsResponse {
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

export function useAdminPayments(params: UseAdminPaymentsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.payments.list(params),
    queryFn: async () => {
      const result = await getAllPayments({
        pagination: params.pagination,
        filters: params.filters,
        includeOrder: params.includeOrder ?? true,
        includeCustomer: params.includeCustomer ?? true,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as AdminPaymentsResponse;
    },
    enabled: !!params.pagination,
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("không có quyền") || error.message.includes("đăng nhập")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export type { PaymentFilters, UseAdminPaymentsParams, PaymentWithDetails, AdminPaymentsResponse }; 