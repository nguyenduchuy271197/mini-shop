"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelOrder } from "@/actions/orders/cancel-order";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface CancelOrderData {
  orderId: number;
  reason?: string;
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CancelOrderData) => cancelOrder(data),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        
        // Invalidate related queries
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
        description: error.message || "Có lỗi xảy ra khi hủy đơn hàng",
        variant: "destructive",
      });
    },
  });
} 