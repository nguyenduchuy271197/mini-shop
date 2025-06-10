"use client";

import { useQuery } from "@tanstack/react-query";
import { calculateCartTotal } from "@/actions/cart/calculate-cart-total";
import { QUERY_KEYS } from "@/lib/query-keys";

export type UseCartTotalOptions = {
  couponCode?: string;
  shippingMethod?: string;
  enabled?: boolean;
};

export function useCartTotal(options: UseCartTotalOptions = {}) {
  const { couponCode, shippingMethod, enabled = true } = options;

  return useQuery({
    queryKey: [...QUERY_KEYS.cart.total(), shippingMethod],
    queryFn: async () => {
      const params: { couponCode?: string; shippingMethod?: string } = {};
      if (couponCode) params.couponCode = couponCode;
      if (shippingMethod) params.shippingMethod = shippingMethod;
      
      const result = await calculateCartTotal(Object.keys(params).length > 0 ? params : undefined);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
} 