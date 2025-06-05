"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processPayment } from "@/actions/payments/process-payment";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface ProcessPaymentData {
  paymentId: number;
  status: "processing" | "completed" | "failed" | "cancelled";
  transactionId?: string;
  gatewayResponse?: Record<string, string | number | boolean | null>;
  failureReason?: string;
}

export function useProcessPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ProcessPaymentData) => processPayment(data),
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
        description: error.message || "Có lỗi xảy ra khi xử lý thanh toán",
        variant: "destructive",
      });
    },
  });
} 