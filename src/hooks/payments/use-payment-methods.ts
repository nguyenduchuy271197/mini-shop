"use client";

import { useQuery } from "@tanstack/react-query";
import { getAvailablePaymentMethods } from "@/actions/payments/get-payment-methods";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface UsePaymentMethodsOptions {
  amount?: number;
  currency: string;
}

export function usePaymentMethods(options?: UsePaymentMethodsOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.methods(),
    queryFn: () => getAvailablePaymentMethods(options),
    enabled: true,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
} 