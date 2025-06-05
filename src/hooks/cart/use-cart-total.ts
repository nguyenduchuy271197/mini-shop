"use client";

import { useQuery } from "@tanstack/react-query";
import { calculateCartTotal } from "@/actions/cart/calculate-cart-total";
import { QUERY_KEYS } from "@/lib/query-keys";

export type UseCartTotalOptions = {
  couponCode?: string;
  enabled?: boolean;
};

export function useCartTotal(options: UseCartTotalOptions = {}) {
  const { couponCode, enabled = true } = options;

  return useQuery({
    queryKey: QUERY_KEYS.cart.total(),
    queryFn: async () => {
      const result = await calculateCartTotal(couponCode ? { couponCode } : undefined);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
} 