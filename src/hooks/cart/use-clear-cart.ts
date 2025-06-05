"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearCart } from "@/actions/cart/clear-cart";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useToast } from "@/hooks/use-toast";

export function useClearCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const result = await clearCart();
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