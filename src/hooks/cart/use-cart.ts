"use client";

import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/actions/cart/get-cart";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCart() {
  return useQuery({
    queryKey: QUERY_KEYS.cart.details(),
    queryFn: async () => {
      const result = await getCart();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 