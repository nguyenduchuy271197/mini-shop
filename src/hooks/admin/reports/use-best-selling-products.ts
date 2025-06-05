"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getBestSellingProducts } from "@/actions/admin/reports/get-best-selling-products";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface UseBestSellingProductsParams {
  dateRange: DateRange;
  limit?: number;
}

interface BestSellingProduct {
  productId: number;
  productName: string;
  productSku: string | null;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  totalOrders: number;
  conversionRate: number;
  stockRemaining: number;
  category: string | null;
}

interface BestSellingProductsResponse {
  success: true;
  products: BestSellingProduct[];
  total: number;
}

export function useBestSellingProducts(params: UseBestSellingProductsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.bestSellingProducts({
      start_date: params.dateRange.startDate,
      end_date: params.dateRange.endDate,
    }),
    queryFn: async () => {
      const result = await getBestSellingProducts(
        params.dateRange,
        params.limit || 20
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as BestSellingProductsResponse;
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
  UseBestSellingProductsParams, 
  BestSellingProduct, 
  BestSellingProductsResponse 
}; 