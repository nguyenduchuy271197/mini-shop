"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyPayment } from "@/actions/payments/verify-payment";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface VerifyPaymentData {
  transactionId: string;
  provider: "vnpay" | "stripe";
  verificationData?: Record<string, string | number | boolean>;
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: VerifyPaymentData) => verifyPayment(data),
    onSuccess: (result) => {
      if (result.success) {
        const { verification } = result;
        
        if (verification.verified && verification.status === "completed") {
          toast({
            title: "Thành công",
            description: "Giao dịch đã được xác minh và hoàn thành thành công",
          });
        } else if (verification.verified) {
          toast({
            title: "Xác minh thành công",
            description: `Giao dịch đã được xác minh với trạng thái: ${verification.status}`,
          });
        } else {
          toast({
            title: "Thông báo",
            description: "Giao dịch chưa thể xác minh được",
            variant: "destructive",
          });
        }
        
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
        description: error.message || "Có lỗi xảy ra khi xác minh thanh toán",
        variant: "destructive",
      });
    },
  });
} 