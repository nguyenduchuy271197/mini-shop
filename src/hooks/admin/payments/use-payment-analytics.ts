"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getPaymentAnalytics } from "@/actions/admin/payments/get-payment-analytics";

interface UsePaymentAnalyticsParams {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  groupBy?: "day" | "week" | "month";
  includeComparison?: boolean;
}

interface PaymentAnalyticsData {
  date: string;
  total_payments: number;
  total_amount: number;
  completed_amount: number;
  failed_amount: number;
  success_rate: number;
  average_payment_value: number;
  payments_by_status: Record<string, number>;
  payments_by_method: Record<string, number>;
}

interface ComparisonData {
  total_payments_change: number;
  total_amount_change: number;
  completed_amount_change: number;
  success_rate_change: number;
  change_percentage: {
    payments: number;
    amount: number;
    completed_amount: number;
    success_rate: number;
  };
}

interface TopPaymentMethod {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

interface PaymentAnalyticsResponse {
  success: true;
  analytics: {
    period: {
      start_date: string;
      end_date: string;
      group_by: "day" | "week" | "month";
    };
    summary: {
      total_payments: number;
      total_amount: number;
      completed_payments: number;
      completed_amount: number;
      failed_payments: number;
      failed_amount: number;
      pending_payments: number;
      pending_amount: number;
      refunded_payments: number;
      refunded_amount: number;
      success_rate: number;
      average_payment_value: number;
      payments_by_status: Record<string, number>;
      payments_by_method: Record<string, number>;
      top_payment_methods: TopPaymentMethod[];
    };
    timeline: PaymentAnalyticsData[];
    comparison?: ComparisonData;
  };
}

export function usePaymentAnalytics(params: UsePaymentAnalyticsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.payments.analytics(params),
    queryFn: async () => {
      const result = await getPaymentAnalytics({
        dateRange: params.dateRange,
        groupBy: params.groupBy ?? "day",
        includeComparison: params.includeComparison ?? false,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as PaymentAnalyticsResponse;
    },
    enabled: !!params.dateRange.startDate && !!params.dateRange.endDate,
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("không có quyền") || error.message.includes("đăng nhập")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 10, // Analytics data is relatively stable, cache for 10 minutes
  });
}

export type { 
  UsePaymentAnalyticsParams,
  PaymentAnalyticsData,
  ComparisonData,
  TopPaymentMethod,
  PaymentAnalyticsResponse 
}; 