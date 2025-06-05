"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItem } from "@/actions/cart/update-cart-item";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useToast } from "@/hooks/use-toast";

export type UpdateCartItemData = {
  cartItemId: number;
  quantity: number;
};

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateCartItemData) => {
      const result = await updateCartItem(data);
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