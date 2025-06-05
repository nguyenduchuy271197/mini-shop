"use client";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getPendingOrders } from "@/actions/admin/orders/get-pending-orders";
import { Order, OrderItem, Product, Profile } from "@/types/custom.types";

interface UsePendingOrdersParams {
  includeItems?: boolean;
  sortBy?: "created_at" | "total_amount" | "priority";
  sortOrder?: "asc" | "desc";
  urgentOnly?: boolean;
}

interface PendingOrderItemWithProduct extends OrderItem {
  product?: Pick<Product, "id" | "name" | "slug" | "images" | "stock_quantity"> | null;
}

interface PendingOrderWithDetails extends Order {
  customer?: Pick<Profile, "id" | "full_name" | "email" | "phone"> | null;
  order_items?: PendingOrderItemWithProduct[];
  items_count?: number;
  total_items_quantity?: number;
  urgency_score?: number;
  days_pending?: number;
  requires_attention?: boolean;
  stock_status?: "available" | "partial" | "unavailable";
}

interface PendingOrderAlert {
  type: "urgent" | "stock" | "old" | "high_value";
  message: string;
  order_ids: number[];
}

interface PendingOrdersResponse {
  success: true;
  orders: PendingOrderWithDetails[];
  summary: {
    total_pending: number;
    urgent_count: number;
    total_value: number;
    average_wait_time: number;
    oldest_order_date: string | null;
    stock_issues_count: number;
  };
  alerts: PendingOrderAlert[];
}

export function usePendingOrders(params?: UsePendingOrdersParams) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.orders.pending(params),
    queryFn: async () => {
      const result = await getPendingOrders(params ? {
        includeItems: params.includeItems ?? false,
        sortBy: params.sortBy ?? "created_at",
        sortOrder: params.sortOrder ?? "asc",
        urgentOnly: params.urgentOnly ?? false,
      } : undefined);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result as PendingOrdersResponse;
    },
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error.message.includes("không có quyền") || error.message.includes("đăng nhập")) {
        return false;
      }
      return failureCount < 2;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for pending orders
  });
}

export type { 
  UsePendingOrdersParams, 
  PendingOrderWithDetails, 
  PendingOrderItemWithProduct,
  PendingOrderAlert,
  PendingOrdersResponse 
}; 