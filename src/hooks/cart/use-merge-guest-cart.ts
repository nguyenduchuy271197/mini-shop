"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mergeGuestCart } from "@/actions/cart/merge-guest-cart";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useToast } from "@/hooks/use-toast";

export type GuestCartItem = {
  productId: number;
  quantity: number;
};

export type MergeGuestCartData = {
  guestCartItems: GuestCartItem[];
};

export function useMergeGuestCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: MergeGuestCartData) => {
      const result = await mergeGuestCart(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Thành công",
        description: data.message,
      });
      // Invalidate cart queries
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.cart.all 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });
} 