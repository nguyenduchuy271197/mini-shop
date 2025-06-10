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
        
        // Only invalidate orders - keep cart intact until payment confirmation
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
        
        // DO NOT invalidate cart queries here - cart will be cleared after payment success
        // This allows users to return to cart if they cancel payment
        // queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all });
        // queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.details() });
        // queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.total() });
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