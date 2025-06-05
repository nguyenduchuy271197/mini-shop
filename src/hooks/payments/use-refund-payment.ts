"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refundPayment } from "@/actions/payments/refund-payment";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface RefundPaymentData {
  paymentId: number;
  amount: number;
  reason: string;
  refundMethod: "original_payment" | "bank_transfer" | "cash";
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: RefundPaymentData) => refundPayment(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.status(variables.paymentId.toString()) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
      } else {
        toast({
          title: "Lỗi",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi hoàn tiền",
        variant: "destructive",
      });
    },
  });
} 