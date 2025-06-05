"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getRevenueAnalytics } from "@/actions/admin/reports/get-revenue-analytics";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface UseRevenueAnalyticsParams {
  dateRange: DateRange;
}

interface RevenueAnalytics {
  totalRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  totalDiscounts: number;
  totalTax: number;
  totalShipping: number;
  totalRefunds: number;
  averageOrderValue: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  revenueByCategory: Array<{
    categoryName: string;
    revenue: number;
    percentage: number;
  }>;
  revenueByPaymentMethod: Array<{
    paymentMethod: string;
    revenue: number;
    percentage: number;
  }>;
  monthlyComparison: {
    currentPeriod: number;
    previousPeriod: number;
    growthPercentage: number;
  };
}

interface RevenueAnalyticsResponse {
  success: true;
  analytics: RevenueAnalytics;
}

export function useRevenueAnalytics(params: UseRevenueAnalyticsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.revenue({
      start_date: params.dateRange.startDate,
      end_date: params.dateRange.endDate,
    }),
    queryFn: async () => {
      const result = await getRevenueAnalytics(params.dateRange);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as RevenueAnalyticsResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("chưa được xác thực") || 
          error.message.includes("Chỉ admin")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 10, // Reports are relatively static, cache for 10 minutes
    enabled: !!(params.dateRange.startDate && params.dateRange.endDate),
  });
}

export type { 
  DateRange,
  UseRevenueAnalyticsParams, 
  RevenueAnalytics, 
  RevenueAnalyticsResponse 
}; 