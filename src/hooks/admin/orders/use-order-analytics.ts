"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getOrderAnalytics } from "@/actions/admin/orders/get-order-analytics";

interface UseOrderAnalyticsParams {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  groupBy?: "day" | "week" | "month";
  includeComparison?: boolean;
}

interface OrderAnalyticsData {
  date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_by_status: Record<string, number>;
  orders_by_payment_status: Record<string, number>;
}

interface ComparisonData {
  total_orders_change: number;
  total_revenue_change: number;
  average_order_value_change: number;
  change_percentage: {
    orders: number;
    revenue: number;
    aov: number;
  };
}

interface TopSellingProduct {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

interface OrderAnalyticsResponse {
  success: true;
  analytics: {
    period: {
      start_date: string;
      end_date: string;
      group_by: "day" | "week" | "month";
    };
    summary: {
      total_orders: number;
      total_revenue: number;
      average_order_value: number;
      unique_customers: number;
      orders_by_status: Record<string, number>;
      orders_by_payment_status: Record<string, number>;
      top_selling_products: TopSellingProduct[];
    };
    timeline: OrderAnalyticsData[];
    comparison?: ComparisonData;
  };
}

export function useOrderAnalytics(params: UseOrderAnalyticsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.orders.analytics(params),
    queryFn: async () => {
      const result = await getOrderAnalytics({
        dateRange: params.dateRange,
        groupBy: params.groupBy ?? "day",
        includeComparison: params.includeComparison ?? false,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as OrderAnalyticsResponse;
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
  UseOrderAnalyticsParams,
  OrderAnalyticsData,
  ComparisonData,
  TopSellingProduct,
  OrderAnalyticsResponse 
}; 