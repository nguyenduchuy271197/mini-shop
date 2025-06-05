"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserOrders } from "@/actions/orders/get-user-orders";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { PaginationParams, OrderStatus } from "@/types/custom.types";

export interface UseUserOrdersOptions {
  userId?: string;
  status?: OrderStatus;
  pagination?: PaginationParams;
}

export function useUserOrders(options?: UseUserOrdersOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.orders.userOrders(options?.userId),
    queryFn: () => getUserOrders(options),
    enabled: true,
  });
} 