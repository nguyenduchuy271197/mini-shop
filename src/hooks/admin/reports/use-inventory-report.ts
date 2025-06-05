"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getInventoryReport } from "@/actions/admin/reports/get-inventory-report";

interface InventoryItem {
  id: number;
  name: string;
  sku: string | null;
  currentStock: number;
  lowStockThreshold: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  stockValue: number;
  price: number;
  category: string | null;
  lastRestocked: string | null;
}

interface InventoryReportSummary {
  totalProducts: number;
  totalStockValue: number;
  inStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageStockValue: number;
}

interface InventoryReportResponse {
  success: true;
  inventory: InventoryItem[];
  summary: InventoryReportSummary;
}

export function useInventoryReport() {
  return useQuery({
    queryKey: QUERY_KEYS.reports.inventory(),
    queryFn: async () => {
      const result = await getInventoryReport();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as InventoryReportResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("chưa được xác thực") || 
          error.message.includes("Chỉ admin")) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 15, // Inventory changes less frequently, cache for 15 minutes
  });
}

export type { 
  InventoryItem,
  InventoryReportSummary, 
  InventoryReportResponse 
}; 