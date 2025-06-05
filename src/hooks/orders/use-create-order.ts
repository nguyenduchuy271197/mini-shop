"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/actions/orders/create-order";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { AddressData } from "@/types/custom.types";

export interface CreateOrderData {
  shipping_address: AddressData;
  billing_address: AddressData;
  shipping_method: string;
  coupon_code?: string;
  notes?: string;
  order_items?: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateOrderData) => createOrder(data),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all });
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
        description: error.message || "Có lỗi xảy ra khi tạo đơn hàng",
        variant: "destructive",
      });
    },
  });
} 