"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createStripeCheckout } from "@/lib/actions/payments/create-stripe-checkout";
import { verifyStripePayment, getStripePaymentStatus } from "@/lib/actions/payments/verify-stripe-payment";
import { StripeCheckoutData } from "@/types/custom.types";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

export function useCreateStripeCheckout() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (checkoutData: StripeCheckoutData) => createStripeCheckout(checkoutData),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi thanh toán",
        description: error.message || "Không thể tạo phiên thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });
}

export function useVerifyStripePayment() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (sessionId: string) => verifyStripePayment(sessionId),
    onSuccess: (data) => {
      if (data.paymentStatus === "completed") {
        toast({
          title: "Thanh toán thành công",
          description: "Đơn hàng của bạn đã được xác nhận.",
          variant: "default",
        });
      } else if (data.paymentStatus === "failed") {
        toast({
          title: "Thanh toán thất bại",
          description: "Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi xác thực thanh toán",
        description: error.message || "Không thể xác thực thanh toán.",
        variant: "destructive",
      });
    },
  });
}

export function useStripePaymentStatus(sessionId: string, enabled: boolean = true) {
  const { toast } = useToast();
  const notificationShown = useRef(false);
  
  const query = useQuery({
    queryKey: ["stripe-payment-status", sessionId],
    queryFn: () => getStripePaymentStatus(sessionId),
    enabled: enabled && !!sessionId,
    refetchInterval: (query) => {
      // Stop refetching if payment is completed or failed
      const data = query.state.data;
      if (data?.success && data?.payment && 
          (data.payment.status === "completed" || data.payment.status === "failed")) {
        return false;
      }
      // Refetch every 3 seconds for pending payments
      return 3000;
    },
  });

  // Show toast notification only once when status changes
  useEffect(() => {
    if (query.data?.success && query.data?.payment && !notificationShown.current) {
      const status = query.data.payment.status;
      
      if (status === "completed") {
        toast({
          title: "Thanh toán thành công",
          description: "Đơn hàng của bạn đã được xác nhận.",
          variant: "default",
        });
        notificationShown.current = true;
      } else if (status === "failed") {
        toast({
          title: "Thanh toán thất bại",
          description: "Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
          variant: "destructive",
        });
        notificationShown.current = true;
      }
    }
  }, [query.data, toast]);

  return query;
} 