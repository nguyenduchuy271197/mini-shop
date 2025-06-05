"use client";

import { useQuery } from "@tanstack/react-query";
import { trackOrder } from "@/actions/orders/track-order";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useTrackOrder(orderNumber: string) {
  return useQuery({
    queryKey: QUERY_KEYS.orders.tracking(orderNumber),
    queryFn: () => trackOrder({ orderNumber }),
    enabled: !!orderNumber && orderNumber.length > 0,
  });
} 