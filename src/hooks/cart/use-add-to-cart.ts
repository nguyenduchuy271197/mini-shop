"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "@/actions/cart/add-to-cart";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useToast } from "@/hooks/use-toast";

export type AddToCartData = {
  productId: number;
  quantity: number;
};

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AddToCartData) => {
      const result = await addToCart(data);
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