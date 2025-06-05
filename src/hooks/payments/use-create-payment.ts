"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPayment } from "@/actions/payments/create-payment";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface CreatePaymentData {
  orderId: number;
  paymentMethod: "vnpay" | "momo" | "cod" | "bank_transfer";
  amount: number;
  currency: string;
  paymentProvider?: string;
  transactionId?: string;
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePaymentData) => createPayment(data),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.all });
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
        description: error.message || "Có lỗi xảy ra khi tạo thanh toán",
        variant: "destructive",
      });
    },
  });
} 