"use client";

import { useQuery } from "@tanstack/react-query";
import { validateCart } from "@/actions/cart/validate-cart";
import { QUERY_KEYS } from "@/lib/query-keys";

export type UseValidateCartOptions = {
  enabled?: boolean;
};

export function useValidateCart(options: UseValidateCartOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: QUERY_KEYS.cart.validation(),
    queryFn: async () => {
      const result = await validateCart();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    enabled,
    staleTime: 1000 * 60 * 1, // 1 minute - shorter since validation is critical
  });
} 