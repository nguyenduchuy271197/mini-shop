"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseRefreshProductsOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useRefreshProducts(options: UseRefreshProductsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all product-related queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.admin.products.all,
        }),
      ]);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Đã làm mới dữ liệu",
        description: "Dữ liệu sản phẩm đã được cập nhật",
      });

      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi làm mới",
        description: "Không thể làm mới dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      });

      options.onError?.(error.message);
    },
  });
}

export type { UseRefreshProductsOptions }; 