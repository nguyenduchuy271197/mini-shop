"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderDetails } from "@/actions/orders/get-order-details";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useOrder(orderId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.orders.detail(orderId.toString()),
    queryFn: () => getOrderDetails({ orderId }),
    enabled: !!orderId && orderId > 0,
  });
} 