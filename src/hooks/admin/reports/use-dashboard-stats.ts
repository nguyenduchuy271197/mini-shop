"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getDashboardStats } from "@/actions/admin/reports/get-dashboard-stats";

interface DashboardStats {
  totalOrders: number;
  totalOrdersToday: number;
  orderGrowthPercentage: number;
  totalRevenue: number;
  revenueToday: number;
  revenueGrowthPercentage: number;
  totalProducts: number;
  productsLowStock: number;
  totalCustomers: number;
  newCustomersToday: number;
  customerGrowthPercentage: number;
  averageOrderValue: number;
  totalPayments: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topSellingProducts: Array<{
    id: number;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    customer_name?: string;
  }>;
}

interface DashboardStatsResponse {
  success: true;
  stats: DashboardStats;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.reports.dashboard(),
    queryFn: async () => {
      const result = await getDashboardStats();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as DashboardStatsResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("chưa được xác thực") || 
          error.message.includes("Chỉ admin")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // Dashboard stats should be fresher, cache for 5 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}

export type { 
  DashboardStats, 
  DashboardStatsResponse 
}; 