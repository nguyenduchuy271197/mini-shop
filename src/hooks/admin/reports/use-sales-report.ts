"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getSalesReport } from "@/actions/admin/reports/get-sales-report";

interface DateRange {
  startDate: string;
  endDate: string;
}

type ReportGroupBy = "day" | "week" | "month" | "year";

interface UseSalesReportParams {
  dateRange: DateRange;
  groupBy?: ReportGroupBy;
}

interface SalesReportItem {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomers: number;
  refundedOrders: number;
  refundedAmount: number;
}

interface SalesReportSummary {
  totalOrders: number;
  totalRevenue: number;
  totalRefunds: number;
  averageOrderValue: number;
  totalCustomers: number;
  orderGrowth: number;
  revenueGrowth: number;
}

interface SalesReportResponse {
  success: true;
  data: SalesReportItem[];
  summary: SalesReportSummary;
}

export function useSalesReport(params: UseSalesReportParams) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.sales({
      start_date: params.dateRange.startDate,
      end_date: params.dateRange.endDate,
    }),
    queryFn: async () => {
      const result = await getSalesReport(
        params.dateRange,
        params.groupBy || "day"
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as SalesReportResponse;
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
  ReportGroupBy,
  UseSalesReportParams, 
  SalesReportItem,
  SalesReportSummary, 
  SalesReportResponse 
}; 