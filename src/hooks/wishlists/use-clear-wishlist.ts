"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearWishlist } from "@/actions/wishlists/clear-wishlist";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface ClearWishlistData {
  confirm: boolean;
}

function isClientError(error: Error): boolean {
  return error.message.includes("validation") || 
         error.message.includes("required") ||
         error.message.includes("xác nhận");
}

export function useClearWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ClearWishlistData) => clearWishlist(data),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.all });
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: result.error,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: isClientError(error) ? "Lỗi xác thực" : "Lỗi hệ thống",
        description: error.message,
      });
    },
    retry: (failureCount, error) => {
      return !isClientError(error as Error) && failureCount < 2;
    },
  });
} 