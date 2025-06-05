"use client";

import { useQuery } from "@tanstack/react-query";
import { getPaymentStatus } from "@/actions/payments/get-payment-status";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface UsePaymentStatusOptions {
  includeOrderInfo?: boolean;
}

export function usePaymentStatus(paymentId: number, options?: UsePaymentStatusOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.payments.status(paymentId.toString()),
    queryFn: () => getPaymentStatus({ 
      paymentId, 
      includeOrderInfo: options?.includeOrderInfo ?? false
    }),
    enabled: !!paymentId && paymentId > 0,
  });
} 