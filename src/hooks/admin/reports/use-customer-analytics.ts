"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getCustomerAnalytics } from "@/actions/admin/reports/get-customer-analytics";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface UseCustomerAnalyticsParams {
  dateRange: DateRange;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
  }>;
  customerSegments: {
    newCustomers: number;
    activeCustomers: number;
    vipCustomers: number;
    dormantCustomers: number;
  };
  orderFrequency: {
    oneTime: number;
    twotoFive: number;
    sixToTen: number;
    moreThanTen: number;
  };
}

interface CustomerAnalyticsResponse {
  success: true;
  analytics: CustomerAnalytics;
}

export function useCustomerAnalytics(params: UseCustomerAnalyticsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.customerAnalytics({
      start_date: params.dateRange.startDate,
      end_date: params.dateRange.endDate,
    }),
    queryFn: async () => {
      const result = await getCustomerAnalytics(params.dateRange);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as CustomerAnalyticsResponse;
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
  UseCustomerAnalyticsParams, 
  CustomerAnalytics, 
  CustomerAnalyticsResponse 
}; 