"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getProductPerformanceReport } from "@/actions/admin/reports/get-product-performance";
import { PaginationParams } from "@/types/custom.types";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface UseProductPerformanceParams {
  dateRange: DateRange;
  pagination?: PaginationParams;
}

interface ProductPerformanceItem {
  productId: number;
  productName: string;
  productSku: string | null;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  totalOrders: number;
  stockRemaining: number;
  conversionRate: number;
  refundedQuantity: number;
  refundedAmount: number;
}

interface ProductPerformanceResponse {
  success: true;
  data: ProductPerformanceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useProductPerformance(params: UseProductPerformanceParams) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.productPerformance({
      start_date: params.dateRange.startDate,
      end_date: params.dateRange.endDate,
    }),
    queryFn: async () => {
      const result = await getProductPerformanceReport(
        params.dateRange,
        params.pagination
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as ProductPerformanceResponse;
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
  UseProductPerformanceParams, 
  ProductPerformanceItem, 
  ProductPerformanceResponse 
}; 